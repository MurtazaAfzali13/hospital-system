import { ReactNode } from 'react'
import { DoctorsProvider } from '@/context/DoctorsContext'

type DoctorLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function DoctorLayout({
  children,
  modal,
}: DoctorLayoutProps) {
  return (
    <DoctorsProvider>
      {children}
      {modal}
    </DoctorsProvider>
  )
}
