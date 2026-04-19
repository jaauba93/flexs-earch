export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      advisors: {
        Row: {
          id: string
          name: string
          title: string | null
          email: string
          phone: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['advisors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['advisors']['Insert']>
      }
      operators: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['operators']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['operators']['Insert']>
      }
      listings: {
        Row: {
          id: string
          operator_id: string
          advisor_id: string | null
          name: string
          slug: string
          description: string | null
          address_street: string
          address_postcode: string
          address_city: string
          address_district: string | null
          latitude: number
          longitude: number
          price_desk_private: number | null
          price_desk_hotdesk: number | null
          total_workstations: number | null
          min_office_size: number | null
          max_office_size: number | null
          year_opened: number | null
          main_image_url: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          sort_order: number
          alt_text: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listing_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listing_images']['Insert']>
      }
      amenities: {
        Row: {
          id: string
          name: string
          name_en: string | null
          slug: string
          category: 'space' | 'operator' | 'building'
          icon: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['amenities']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['amenities']['Insert']>
      }
      listing_amenities: {
        Row: {
          listing_id: string
          amenity_id: string
        }
        Insert: Database['public']['Tables']['listing_amenities']['Row']
        Update: Partial<Database['public']['Tables']['listing_amenities']['Row']>
      }
      enquiries: {
        Row: {
          id: string
          email: string
          phone: string | null
          message: string | null
          workstations_from: number | null
          workstations_to: number | null
          listing_ids: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['enquiries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['enquiries']['Insert']>
      }
      flex_calculator_settings: {
        Row: {
          id: string
          intro_eyebrow: string
          intro_title: string
          intro_body: string
          intro_disclaimer_approx: string
          intro_disclaimer_market: string
          intro_disclaimer_support: string
          default_headcount: number
          default_city_slug: string
          default_location_type: string
          default_fitout_standard: string
          default_density_key: string
          default_flex_lease_months: number
          default_conventional_lease_months: number
          utilities_and_maintenance_eur_per_sqm: number
          flex_common_area_sqm_per_desk: number
          add_on_factor: number
          rent_free_months_per_year: number
          location_options: Json
          fitout_options: Json
          flex_lease_options: Json
          conventional_lease_options: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flex_calculator_settings']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['flex_calculator_settings']['Insert']>
      }
      flex_calculator_density_options: {
        Row: {
          key: string
          label: string
          sort_order: number
          flex_office_sqm_per_desk: number
          conventional_sqm_per_person_avg: number
          is_active: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flex_calculator_density_options']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['flex_calculator_density_options']['Insert']>
      }
      flex_calculator_market_data: {
        Row: {
          city_slug: string
          city_label: string
          sort_order: number
          is_active: boolean
          headline_rent_cbd_eur: number
          non_cbd_deduction_eur: number
          service_charge_cbd_pln: number
          service_charge_non_cbd_pln: number
          flex_price_cbd_pln: number
          flex_price_non_cbd_pln: number
          fitout_contribution_cbd_eur: number
          fitout_contribution_non_cbd_eur: number
          fitout_cost_basic_eur: number
          fitout_cost_enhanced_eur: number
          fitout_cost_premium_eur: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flex_calculator_market_data']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['flex_calculator_market_data']['Insert']>
      }
    }
  }
}

// Convenience types
export type Advisor = Database['public']['Tables']['advisors']['Row']
export type Operator = Database['public']['Tables']['operators']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingImage = Database['public']['Tables']['listing_images']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type Enquiry = Database['public']['Tables']['enquiries']['Row']

export interface ListingWithRelations extends Listing {
  operator: Operator
  advisor: Advisor | null
  images: ListingImage[]
  amenities: Amenity[]
}

export interface SearchFilters {
  city?: string
  district?: string
  stanowiska_od?: number
  stanowiska_do?: number
  cena_do?: number
  udogodnienia?: string[]
  operator?: string
  sort?: 'cena_asc' | 'cena_desc'
  lat?: number
  lng?: number
  radius?: number
}
