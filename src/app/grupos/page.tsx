'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Group, UserWithRole, GroupWithUser } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function GruposPage() {
  const [groups, setGroups] = useState<GroupWithUser[]>([])
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    checkUser()
    loadData()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/auth')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        roles(name)
      `)
      .eq('id', authUser.id)
      .single()

    setUser(userData)

    // Check if user has permission (coordinator or admin)
    if (userData?.roles?.name !== 'coordinator' && userData?.roles?.name !== 'admin') {
      router.push('/incidentes')
    }
  }

  const loadData = async () => {
    try {
      const { data } = await supabase
        .from('groups')
        .select(`
          *,
          users(display_name)
        `)
        .order('name')

      setGroups(data || [])
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('groups')
          .update(formData)
          .eq('id', editingGroup.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('groups')
          .insert({
            ...formData,
            created_by: user.id
          })

        if (error) throw error
      }

      setShowForm(false)
      setEditingGroup(null)
      setFormData({ name: '' })
      loadData()
    } catch (error) {
      console.error('Error saving group:', error)
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) return

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting group:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingGroup(null)
    setFormData({ name: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Nuevo Grupo
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del grupo"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingGroup ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Groups List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {groups.map((group) => (
                <li key={group.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-600">
                        Creado por: {group.users?.display_name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {groups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay grupos registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
