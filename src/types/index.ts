/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'designer' | 'contractor' | 'admin';

export interface UserAccount {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export type ProjectType = 'residential' | 'commercial' | 'apartment' | 'renovation' | 'single_room' | 'full_villa';

export type DesignRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export interface ConsultationMeeting {
  scheduled_date: string;
  scheduled_time: string;
  mode: 'virtual' | 'in_person';
  meeting_link?: string;
  location_address?: string;
  designer_notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DesignRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  assigned_designer_id: string | null;
  assigned_designer_name?: string | null;
  title: string;
  project_type: ProjectType;
  area_sqft: number;
  budget_min_paise: number;
  budget_max_paise: number;
  style_preferences: string[];
  city: string;
  requirements: string;
  status: DesignRequestStatus;
  meeting?: ConsultationMeeting;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  design_request_id: string;
  request_title: string;
  designer_id: string;
  designer_name: string;
  title: string;
  scope: string;
  deliverables: string[];
  price_paise: number;
  estimated_duration_weeks: number;
  valid_until: string;
  status: ProposalStatus;
  revision: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  design_request_id: string;
  proposal_id: string;
  customer_id: string;
  customer_name: string;
  designer_id: string;
  designer_name: string;
  title: string;
  status: ProjectStatus;
  start_date: string;
  target_end_date: string;
  progress_percent: number;
  budget_paise: number;
  image_url?: string;
  gallery_images?: string[];
  location?: string;
  scope_summary?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export interface TaskProgressImage {
  id: string;
  task_id: string;
  project_id: string;
  uploader_id: string;
  uploader_name: string;
  uploader_role: UserRole;
  image_url: string;
  caption?: string;
  stage_tag?: string;
  progress_percent_at_upload: number;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  project_title: string;
  assigned_contractor_id: string;
  assigned_contractor_name: string;
  title: string;
  description: string;
  category: 'electrical' | 'carpentry' | 'painting' | 'flooring' | 'plumbing' | 'general' | 'civil';
  status: TaskStatus;
  due_date: string;
  progress_percent: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  progress_images?: TaskProgressImage[];
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  message: string;
  attachment_name?: string;
  created_at: string;
}

export type ProductCategory = 'lighting' | 'furniture' | 'rugs' | 'wall_decor' | 'accessories';

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  price_paise: number;
  stock_quantity: number;
  is_active: boolean;
  dimensions?: string;
  material?: string;
  color?: string;
  featured?: boolean;
  image_color_tone?: string;
  image_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ArchitecturalProjectShowcase {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  carpet_area_sqft: number;
  duration_weeks: number;
  budget_paise: number;
  designer_name: string;
  hero_image: string;
  gallery_images: string[];
  before_image?: string;
  after_image?: string;
  scope_highlights: string[];
  materials_used: string[];
  client_review: {
    quote: string;
    author: string;
    rating: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
  sku_snapshot: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  order_number: string;
  status: OrderStatus;
  subtotal_paise: number;
  shipping_paise: number;
  tax_paise: number;
  total_paise: number;
  currency: 'INR';
  shipping_address: ShippingAddress;
  payment_reference?: string;
  payment_method?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  order_number: string;
  provider: 'demo' | 'razorpay';
  provider_payment_id: string;
  provider_order_id: string;
  payment_method?: string;
  amount_paise: number;
  currency: 'INR';
  status: 'captured' | 'failed' | 'pending';
  signature_verified: boolean;
  created_at: string;
}
