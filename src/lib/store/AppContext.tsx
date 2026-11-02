/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ArchitecturalProjectShowcase,
  CartItem,
  ConsultationMeeting,
  DesignRequest,
  Order,
  PaymentRecord,
  Product,
  Project,
  ProjectUpdate,
  Proposal,
  ShippingAddress,
  Task,
  TaskProgressImage,
} from '../../types';
import { useAuth } from '../auth/AuthContext';
import { PROGRESS_IMAGES_BUCKET, supabase } from '../supabase/client';

interface AppContextType {
  isLoading: boolean;
  loadError: string | null;

  // Design Requests
  requests: DesignRequest[];
  submitRequest: (request: Omit<DesignRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'assigned_designer_id' | 'assigned_designer_name'>) => Promise<DesignRequest>;
  assignDesigner: (requestId: string, designerId: string, designerName: string) => Promise<void>;
  scheduleMeeting: (requestId: string, meetingData: ConsultationMeeting) => Promise<void>;

  // Proposals
  proposals: Proposal[];
  createProposal: (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'status' | 'revision'>) => Promise<Proposal>;
  acceptProposal: (proposalId: string) => Promise<Project>;
  rejectProposal: (proposalId: string) => Promise<void>;

  // Projects
  projects: Project[];
  showcases: ArchitecturalProjectShowcase[];
  updates: ProjectUpdate[];
  updateProjectStatus: (projectId: string, status: Project['status']) => Promise<void>;
  addProjectUpdate: (projectId: string, message: string, attachmentName?: string) => Promise<void>;

  // Tasks & Progress Gallery
  tasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'progress_percent'>) => Promise<Task>;
  updateTaskProgress: (taskId: string, status: Task['status'], progressPercent: number, notes?: string) => Promise<void>;
  progressImages: TaskProgressImage[];
  addProgressImage: (
    taskId: string,
    projectId: string,
    imageData: {
      image_url: string;
      caption?: string;
      stage_tag?: string;
      progress_percent?: number;
    }
  ) => Promise<TaskProgressImage>;
  deleteProgressImage: (imageId: string) => Promise<boolean>;
  getTaskProgressImages: (taskId: string) => TaskProgressImage[];

  // Products (Store)
  products: Product[];
  createProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotalPaise: number;
  cartItemCount: number;

  // Checkout & Orders
  orders: Order[];
  payments: PaymentRecord[];
  placeDemoOrder: (address: ShippingAddress) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const unwrap = ({ data, error }: { data: any; error: { message: string } | null }): any => {
  if (error) throw new Error(error.message);
  return data;
};

const PUBLIC_TABLES = ['products'];
const SIGNED_IN_TABLES = [
  'design_requests',
  'proposals',
  'projects',
  'tasks',
  'project_updates',
  'task_progress_images',
  'cart_items',
  'orders',
  'payments',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  const userId = currentUser?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showcases, setShowcases] = useState<ArchitecturalProjectShowcase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progressImages, setProgressImages] = useState<TaskProgressImage[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const cartRef = useRef(cart);
  cartRef.current = cart;
  const latestFetch = useRef(0);

  const refresh = useCallback(async () => {
    const fetchId = ++latestFetch.current;
    try {
      const [productRows, showcaseRows] = await Promise.all([
        supabase.from('products').select('*').order('created_at').then(unwrap),
        supabase.from('project_showcases').select('*').order('sort_order').then(unwrap),
      ]);

      if (!userId) {
        if (fetchId !== latestFetch.current) return;
        setProducts(productRows as Product[]);
        setShowcases(showcaseRows as ArchitecturalProjectShowcase[]);
        setRequests([]);
        setProposals([]);
        setProjects([]);
        setTasks([]);
        setProgressImages([]);
        setUpdates([]);
        setOrders([]);
        setPayments([]);
        setLoadError(null);
        return;
      }

      const newestFirst = { ascending: false };
      const [requestRows, proposalRows, projectRows, taskRows, imageRows, updateRows, orderRows, paymentRows, cartRows] =
        await Promise.all([
          supabase.from('design_requests').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('proposals').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('projects').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('tasks').select('*').order('created_at').then(unwrap),
          supabase.from('task_progress_images').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('project_updates').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('orders').select('*, items:order_items(*)').order('created_at', newestFirst).then(unwrap),
          supabase.from('payments').select('*').order('created_at', newestFirst).then(unwrap),
          supabase.from('cart_items').select('quantity, product:products(*)').order('updated_at').then(unwrap),
        ]);

      // A slower response from before a sign-out must not overwrite newer data.
      if (fetchId !== latestFetch.current) return;
      setProducts(productRows as Product[]);
      setShowcases(showcaseRows as ArchitecturalProjectShowcase[]);
      setRequests(requestRows as DesignRequest[]);
      setProposals(proposalRows as Proposal[]);
      setProjects(projectRows as Project[]);
      setTasks(taskRows as Task[]);
      setProgressImages(imageRows as TaskProgressImage[]);
      setUpdates(updateRows as ProjectUpdate[]);
      setOrders(orderRows as unknown as Order[]);
      setPayments(paymentRows as PaymentRecord[]);
      setCart((cartRows as unknown as CartItem[]).filter(row => row.product));
      setLoadError(null);
    } catch (err: any) {
      console.error('Could not load data from Supabase:', err);
      if (fetchId === latestFetch.current) setLoadError(err.message || 'Could not load data.');
    } finally {
      if (fetchId === latestFetch.current) setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthLoading) return;
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      // Items added while signed out join the account's saved cart.
      const guestCart = cartRef.current;
      if (userId && guestCart.length > 0) {
        const saved = await supabase.from('cart_items').select('product_id, quantity');
        const savedRows = (saved.data ?? []) as { product_id: string; quantity: number }[];
        await supabase.from('cart_items').upsert(
          guestCart.map(item => ({
            customer_id: userId,
            product_id: item.product.id,
            quantity: Math.min(
              item.quantity + (savedRows.find(row => row.product_id === item.product.id)?.quantity ?? 0),
              item.product.stock_quantity,
              100
            ),
          }))
        );
      }
      if (!userId) setCart([]);
      if (!cancelled) await refresh();
    })();

    const channel = supabase.channel(`app-${userId ?? 'guest'}`);
    for (const table of userId ? [...PUBLIC_TABLES, ...SIGNED_IN_TABLES] : PUBLIC_TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(debounce);
        debounce = setTimeout(refresh, 150);
      });
    }
    supabase.realtime.setAuth().then(() => {
      if (!cancelled) channel.subscribe();
    });

    return () => {
      cancelled = true;
      clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [userId, isAuthLoading, refresh]);

  // 1. Design Requests
  const submitRequest: AppContextType['submitRequest'] = async data => {
    const saved = unwrap(await supabase.from('design_requests').insert(data).select().single());
    await refresh();
    return saved as DesignRequest;
  };

  const assignDesigner: AppContextType['assignDesigner'] = async (requestId, designerId, designerName) => {
    const current = requests.find(req => req.id === requestId);
    unwrap(
      await supabase
        .from('design_requests')
        .update({
          assigned_designer_id: designerId,
          assigned_designer_name: designerName,
          status: current?.status === 'submitted' ? 'under_review' : current?.status,
        })
        .eq('id', requestId)
    );
    await refresh();
  };

  const scheduleMeeting: AppContextType['scheduleMeeting'] = async (requestId, meetingData) => {
    unwrap(await supabase.from('design_requests').update({ status: 'meeting_scheduled', meeting: meetingData }).eq('id', requestId));
    await refresh();
  };

  // 2. Proposals (the database marks the request as proposal_sent)
  const createProposal: AppContextType['createProposal'] = async proposalData => {
    const saved = unwrap(await supabase.from('proposals').insert({ ...proposalData, status: 'sent', revision: 1 }).select().single());
    await refresh();
    return saved as Proposal;
  };

  const acceptProposal: AppContextType['acceptProposal'] = async proposalId => {
    const project = unwrap(await supabase.rpc('accept_proposal', { p_proposal_id: proposalId }));
    await refresh();
    return project as Project;
  };

  const rejectProposal: AppContextType['rejectProposal'] = async proposalId => {
    unwrap(await supabase.rpc('reject_proposal', { p_proposal_id: proposalId }));
    await refresh();
  };

  // 3. Projects
  const updateProjectStatus: AppContextType['updateProjectStatus'] = async (projectId, status) => {
    unwrap(await supabase.from('projects').update({ status }).eq('id', projectId));
    await refresh();
  };

  // The database stamps the author from the session.
  const addProjectUpdate: AppContextType['addProjectUpdate'] = async (projectId, message, attachmentName) => {
    unwrap(await supabase.from('project_updates').insert({ project_id: projectId, message, attachment_name: attachmentName }));
    await refresh();
  };

  // 4. Tasks (the database rolls task progress up into the project)
  const createTask: AppContextType['createTask'] = async taskData => {
    const saved = unwrap(await supabase.from('tasks').insert(taskData).select().single());
    await refresh();
    return saved as Task;
  };

  const updateTaskProgress: AppContextType['updateTaskProgress'] = async (taskId, status, progressPercent, notes) => {
    unwrap(await supabase.from('tasks').update({ status, progress_percent: progressPercent, notes: notes || null }).eq('id', taskId));
    await refresh();
  };

  // 5. Progress Gallery
  const getTaskProgressImages = (taskId: string): TaskProgressImage[] =>
    progressImages.filter(img => img.task_id === taskId);

  const uploadIfDataUrl = async (imageUrl: string): Promise<string> => {
    if (!imageUrl.startsWith('data:image/')) return imageUrl;
    const blob = await (await fetch(imageUrl)).blob();
    const path = `${userId}/${crypto.randomUUID()}.${blob.type.split('/')[1]}`;
    unwrap(await supabase.storage.from(PROGRESS_IMAGES_BUCKET).upload(path, blob, { contentType: blob.type }));
    return supabase.storage.from(PROGRESS_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const addProgressImage: AppContextType['addProgressImage'] = async (taskId, projectId, imageData) => {
    const task = tasks.find(t => t.id === taskId);
    const saved = unwrap(
      await supabase
        .from('task_progress_images')
        .insert({
          task_id: taskId,
          project_id: projectId,
          image_url: await uploadIfDataUrl(imageData.image_url),
          caption: imageData.caption,
          stage_tag: imageData.stage_tag || (task ? `${task.category.toUpperCase()} Inspection` : 'Site Verification'),
          progress_percent_at_upload: imageData.progress_percent ?? task?.progress_percent ?? 0,
        })
        .select()
        .single()
    );
    await addProjectUpdate(
      projectId,
      `📸 [Progress Gallery] ${currentUser?.display_name} uploaded a site photo for "${task?.title || 'Milestone'}": "${imageData.caption || 'Site execution milestone verified.'}"`
    );
    return saved as TaskProgressImage;
  };

  const deleteProgressImage: AppContextType['deleteProgressImage'] = async imageId => {
    const target = progressImages.find(img => img.id === imageId);
    unwrap(await supabase.from('task_progress_images').delete().eq('id', imageId));
    const marker = `/${PROGRESS_IMAGES_BUCKET}/`;
    if (target?.image_url.includes(marker)) {
      // shortcut: storage only lets the owner or an admin remove the file, so a designer's delete leaves it behind; move to an Edge Function if that matters.
      await supabase.storage.from(PROGRESS_IMAGES_BUCKET).remove([target.image_url.split(marker)[1]]);
    }
    await refresh();
    return true;
  };

  // 6. Store / Products
  const createProduct: AppContextType['createProduct'] = async productData => {
    const saved = unwrap(await supabase.from('products').insert(productData).select().single());
    await refresh();
    return saved as Product;
  };

  const updateProduct: AppContextType['updateProduct'] = async (id, productData) => {
    unwrap(await supabase.from('products').update(productData).eq('id', id));
    await refresh();
  };

  const updateStock: AppContextType['updateStock'] = (id, newStock) =>
    updateProduct(id, { stock_quantity: Math.max(0, newStock) });

  // 7. Cart: updated on screen immediately, saved to Supabase when signed in
  const saveCartLine = (productId: string, quantity: number) => {
    if (!userId) return;
    const write =
      quantity > 0
        ? supabase.from('cart_items').upsert({ customer_id: userId, product_id: productId, quantity })
        : supabase.from('cart_items').delete().eq('customer_id', userId).eq('product_id', productId);
    write.then(({ error }) => {
      if (error) console.warn('Could not save cart:', error.message);
    });
  };

  const setCartQuantity = (product: Product, quantity: number) => {
    const next = Math.min(quantity, product.stock_quantity, 100);
    setCart(prev =>
      next <= 0
        ? prev.filter(item => item.product.id !== product.id)
        : prev.some(item => item.product.id === product.id)
          ? prev.map(item => (item.product.id === product.id ? { ...item, quantity: next } : item))
          : [...prev, { product, quantity: next }]
    );
    saveCartLine(product.id, Math.max(next, 0));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    setCartQuantity(product, (existing?.quantity ?? 0) + quantity);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const existing = cart.find(item => item.product.id === productId);
    if (existing) setCartQuantity(existing.product, quantity);
  };

  const removeFromCart = (productId: string) => updateCartQuantity(productId, 0);

  const clearCart = () => {
    setCart([]);
    if (userId) {
      supabase.from('cart_items').delete().eq('customer_id', userId).then(({ error }) => {
        if (error) console.warn('Could not clear cart:', error.message);
      });
    }
  };

  const cartTotalPaise = cart.reduce((sum, item) => sum + item.product.price_paise * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 8. Orders: the database recalculates prices, checks stock and records the demo payment
  const placeDemoOrder: AppContextType['placeDemoOrder'] = async address => {
    const order = unwrap(
      await supabase.rpc('place_demo_order', {
        p_address: address,
        p_items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
      })
    );
    setCart([]);
    await refresh();
    return order as unknown as Order;
  };

  const updateOrderStatus: AppContextType['updateOrderStatus'] = async (orderId, status) => {
    unwrap(await supabase.from('orders').update({ status }).eq('id', orderId));
    await refresh();
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        loadError,
        requests,
        submitRequest,
        assignDesigner,
        scheduleMeeting,
        proposals,
        createProposal,
        acceptProposal,
        rejectProposal,
        projects,
        showcases,
        updates,
        updateProjectStatus,
        addProjectUpdate,
        tasks,
        createTask,
        updateTaskProgress,
        progressImages,
        addProgressImage,
        deleteProgressImage,
        getTaskProgressImages,
        products,
        createProduct,
        updateProduct,
        updateStock,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalPaise,
        cartItemCount,
        orders,
        payments,
        placeDemoOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
