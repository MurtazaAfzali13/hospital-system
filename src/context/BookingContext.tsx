"use client";

import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useMemo } from 'react';

// انواع
type TimeSlotStatus = 'available' | 'booked' | 'reserved' | 'mine';

type TimeSlot = {
  time: string;
  status: TimeSlotStatus;
  bookedBy?: string;
  patientPhone?: string;
  verificationCode?: string;
};

type BookingState = {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  bookedSlots: Set<string>; // برای چک سریع
  reservedSlots: Set<string>; // اسلات‌هایی که در حال رزرو هستند
  loading: boolean;
  doctorId: string;
};

type BookingAction =
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'INIT_SLOTS'; payload: TimeSlot[] }
  | { type: 'RESERVE_SLOT'; payload: string }
  | { type: 'BOOK_SLOT'; payload: { time: string; patientPhone: string; verificationCode: string } }
  | { type: 'RELEASE_SLOT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_FROM_SERVER'; payload: any[] };

// Helper function برای تبدیل status string به TimeSlotStatus
const normalizeStatus = (status: string): TimeSlotStatus => {
  switch (status) {
    case 'booked':
    case 'reserved':
    case 'mine':
      return status;
    default:
      return 'available';
  }
};

// Helper function برای تبدیل داده‌های سرور به TimeSlot
const normalizeTimeSlot = (data: any): TimeSlot => {
  const time = data.time || data.appointment_time || '';
  let status: TimeSlotStatus = 'available';
  
  // تشخیص status بر اساس داده‌های موجود
  if (data.status === 'mine' || data.isMine) {
    status = 'mine';
  } else if (data.status === 'booked' || data.status === 'confirmed' || data.status === 'pending') {
    status = 'booked';
  } else if (data.status === 'reserved') {
    status = 'reserved';
  }
  
  return {
    time: time.length > 5 ? time.substring(0, 5) : time,
    status,
    bookedBy: data.bookedBy || data.patient_name,
    patientPhone: data.patientPhone || data.patient_phone,
    verificationCode: data.verificationCode || data.verification_code
  };
};

// ایجاد Context
interface BookingContextType {
  state: BookingState;
  dispatch: Dispatch<BookingAction>;
  reserveTimeSlot: (time: string) => Promise<boolean>;
  confirmBooking: (time: string, patientPhone: string, verificationCode: string) => void;
  cancelReservation: (time: string) => void;
  normalizeServerData: (serverData: any[]) => TimeSlot[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Reducer با تایپ‌های صحیح
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, timeSlots: [] };
    
    case 'INIT_SLOTS':
      const bookedSlotsFromInit = new Set<string>(
        action.payload
          .filter(s => s.status === 'booked' || s.status === 'mine')
          .map(s => s.time)
      );
      return {
        ...state,
        timeSlots: action.payload,
        bookedSlots: bookedSlotsFromInit,
        reservedSlots: new Set<string>()
      };
    
    case 'RESERVE_SLOT':
      if (state.bookedSlots.has(action.payload) || state.reservedSlots.has(action.payload)) {
        return state;
      }
      return {
        ...state,
        reservedSlots: new Set<string>([...Array.from(state.reservedSlots), action.payload]),
        timeSlots: state.timeSlots.map(slot =>
          slot.time === action.payload ? { ...slot, status: 'reserved' } : slot
        )
      };
    
    case 'BOOK_SLOT':
      return {
        ...state,
        bookedSlots: new Set<string>([...Array.from(state.bookedSlots), action.payload.time]),
        reservedSlots: new Set<string>(
          Array.from(state.reservedSlots).filter(t => t !== action.payload.time)
        ),
        timeSlots: state.timeSlots.map(slot =>
          slot.time === action.payload.time
            ? {
                ...slot,
                status: 'booked',
                bookedBy: action.payload.patientPhone,
                verificationCode: action.payload.verificationCode
              }
            : slot
        )
      };
    
    case 'RELEASE_SLOT':
      return {
        ...state,
        reservedSlots: new Set<string>(
          Array.from(state.reservedSlots).filter(t => t !== action.payload)
        ),
        timeSlots: state.timeSlots.map(slot =>
          slot.time === action.payload ? { ...slot, status: 'available' } : slot
        )
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'UPDATE_FROM_SERVER':
      const normalizedTimeSlots: TimeSlot[] = action.payload.map(normalizeTimeSlot);
      
      const newBookedSlots = new Set<string>(
        normalizedTimeSlots
          .filter(s => s.status === 'booked' || s.status === 'mine')
          .map(s => s.time)
      );
      
      return {
        ...state,
        timeSlots: normalizedTimeSlots,
        bookedSlots: newBookedSlots,
        reservedSlots: new Set<string>(
          Array.from(state.reservedSlots).filter(t => !newBookedSlots.has(t))
        )
      };
    
    default:
      return state;
  }
}

// Provider Component
export function BookingProvider({ 
  children, 
  doctorId 
}: { 
  children: ReactNode; 
  doctorId: string; 
}) {
  const [state, dispatch] = useReducer(bookingReducer, {
    selectedDate: new Date(),
    timeSlots: [],
    bookedSlots: new Set<string>(),
    reservedSlots: new Set<string>(),
    loading: false,
    doctorId
  });

  // Helper function برای نرمالایز کردن داده‌های سرور
  const normalizeServerData = useMemo(() => (serverData: any[]): TimeSlot[] => {
    return serverData.map(normalizeTimeSlot);
  }, []);

  // رزرو موقت یک زمان
  const reserveTimeSlot = async (time: string): Promise<boolean> => {
    if (state.bookedSlots.has(time) || state.reservedSlots.has(time)) {
      return false;
    }

    dispatch({ type: 'RESERVE_SLOT', payload: time });

    try {
      const dateStr = state.selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/doctors/${doctorId}/check-slot?date=${dateStr}&time=${time}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reserve', userId: 'user-' + Date.now() })
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (!result.success) {
        dispatch({ type: 'RELEASE_SLOT', payload: time });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Reserve time slot error:', error);
      dispatch({ type: 'RELEASE_SLOT', payload: time });
      return false;
    }
  };

  // تایید نهایی رزرو
  const confirmBooking = (time: string, patientPhone: string, verificationCode: string) => {
    dispatch({
      type: 'BOOK_SLOT',
      payload: { time, patientPhone, verificationCode }
    });
  };

  // لغو رزرو
  const cancelReservation = (time: string) => {
    dispatch({ type: 'RELEASE_SLOT', payload: time });
  };

  const contextValue: BookingContextType = useMemo(() => ({
    state,
    dispatch,
    reserveTimeSlot,
    confirmBooking,
    cancelReservation,
    normalizeServerData
  }), [state, normalizeServerData]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

// Hook برای استفاده از Context
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}