export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: 'admin' | 'coordinator' | 'teacher'
          created_at: string
        }
        Insert: {
          id?: string
          name: 'admin' | 'coordinator' | 'teacher'
          created_at?: string
        }
        Update: {
          id?: string
          name?: 'admin' | 'coordinator' | 'teacher'
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          role_id: string
          display_name: string
          school_role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id: string
          display_name: string
          school_role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          display_name?: string
          school_role?: string
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          group_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          group_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          group_id?: string
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          student_id: string
          category_id: string
          severity: 'low' | 'medium' | 'high'
          description: string
          date: string
          teacher_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          category_id: string
          severity: 'low' | 'medium' | 'high'
          description: string
          date: string
          teacher_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          category_id?: string
          severity?: 'low' | 'medium' | 'high'
          description?: string
          date?: string
          teacher_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Role = Database['public']['Tables']['roles']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Incident = Database['public']['Tables']['incidents']['Row']

export type UserRole = 'admin' | 'coordinator' | 'teacher'
export type Severity = 'low' | 'medium' | 'high'
