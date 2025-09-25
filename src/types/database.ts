// Import and re-export the proper Supabase-generated types
import type { Database } from './supabase'
export type { Database }

export type Role = Database['public']['Tables']['roles']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Incident = Database['public']['Tables']['incidents']['Row']

// Utility types for working with relationships
// These represent the actual query results with joined data

// User with role relationship
export type UserWithRole = User & {
  roles?: Pick<Role, 'name'>
}

// Student with group relationship  
export type StudentWithGroup = Student & {
  groups?: Pick<Group, 'name'>
}

// Group with creator relationship
export type GroupWithUser = Group & {
  users?: Pick<User, 'display_name'>
}

// Category with creator relationship
export type CategoryWithUser = Category & {
  users?: Pick<User, 'display_name'>
}

// Incident with all related data
export type IncidentWithDetails = Incident & {
  students?: Pick<Student, 'name'> & {
    groups?: Pick<Group, 'name'>
  }
  categories?: Pick<Category, 'name'>
  users?: Pick<User, 'display_name'> // teacher who created the incident
}

export type UserRole = 'admin' | 'coordinator' | 'teacher'
export type Severity = 'low' | 'medium' | 'high'
