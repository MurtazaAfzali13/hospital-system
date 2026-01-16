'use client'
import { createContext, useContext, useEffect, useReducer } from "react"

export interface Doctor {
  id: string
  full_name: string
  bio: string
  image_url: string
  phone_number: string
  specialization_id: number
}

interface State {
  doctors: Doctor[]
  filteredDoctors: Doctor[]
  loading: boolean
}

type Action =
  | { type: "SET_DOCTORS"; payload: Doctor[] }
  | { type: "SEARCH"; payload: string }
  | { type: "LOADING" }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true }

    case "SET_DOCTORS":
      return {
        doctors: action.payload,
        filteredDoctors: action.payload,
        loading: false,
      }

    case "SEARCH":
      return {
        ...state,
        filteredDoctors: state.doctors.filter((doctor) =>
          doctor.full_name
            .toLowerCase()
            .includes(action.payload.toLowerCase())
        ),
      }

    default:
      return state
  }
}

const DoctorsContext = createContext<any>(null)

export const DoctorsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    doctors: [],
    filteredDoctors: [],
    loading: true,
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      dispatch({ type: "LOADING" })
      const res = await fetch("/api/doctors")
      const data = await res.json()
      dispatch({ type: "SET_DOCTORS", payload: data })
    }
    fetchDoctors()
  }, [])

  // get doctor by ID
  const getDoctorById = (id: string) =>
    state.doctors.find(
      (doctor) => String(doctor.id) === String(id)
    )

  return (
    <DoctorsContext.Provider value={{ state, dispatch,getDoctorById }}>
      {children}
    </DoctorsContext.Provider>
  )
}

export const useDoctors = () => {
  const context = useContext(DoctorsContext)
  if (!context) {
    throw new Error("useDoctors must be used inside DoctorsProvider")
  }
  return context
}
