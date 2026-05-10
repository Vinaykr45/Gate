'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function DeleteTestButton({ testId }: { testId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete this test?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    })

    if (!result.isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete test')
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Error deleting test.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
      title="Delete test"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
