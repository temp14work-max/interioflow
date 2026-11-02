/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useApp } from '../../lib/store/AppContext';
import { Product, UserRole, OrderStatus } from '../../types';
import { formatINR, formatDate } from '../../lib/utils/formatters';
import {
  ShieldCheck,
  Package,
  Users,
  CreditCard,
  Plus,
  Edit2,
  Check,
  Truck,
  RotateCcw,
} from 'lucide-react';

// Admin actions are enforced by the database; this only surfaces a refusal.
const reportFailure = (action: Promise<unknown>) => {
  action.catch(err => window.alert(err.message));
};

export const AdminDashboard: React.FC = () => {
  const { users, updateUserRole, currentUser } = useAuth();
  const {
    products,
    createProduct,
    updateProduct,
    updateStock,
    orders,
    payments,
    updateOrderStatus,
    requests,
    projects,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'orders' | 'payments' | 'requests'>('users');

  // Add Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('lighting');
  const [newPriceRupees, setNewPriceRupees] = useState<number>(15000);
  const [newStock, setNewStock] = useState<number>(10);
  const [newDesc, setNewDesc] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newDimensions, setNewDimensions] = useState('');

  // Stock edit tracking
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim()) return;

    reportFailure(createProduct({
      sku: newSku.trim(),
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newName.trim(),
      description: newDesc.trim() || 'Curated architectural décor item.',
      category: newCategory,
      price_paise: Math.round(newPriceRupees * 100),
      stock_quantity: Number(newStock),
      is_active: true,
      material: newMaterial.trim() || undefined,
      dimensions: newDimensions.trim() || undefined,
    }));

    setShowAddProduct(false);
    setNewSku('');
    setNewName('');
    setNewDesc('');
  };

  const totalStoreRevenuePaise = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_paise, 0);

  return (
    <div className="space-y-8">
      {/* Admin Operations Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Super Administrator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 font-serif tracking-tight mt-1">
            Platform Operations & Governance
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
            Logged in as <strong className="text-stone-900 font-mono">{currentUser?.email}</strong>. Manage user roles, govern product inventory, track client consultations, and audit financial payments.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Registered Users
            </span>
            <span className="font-mono text-xl font-bold text-stone-900 tabular-nums">
              {users.length}
            </span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
              Store Revenue
            </span>
            <span className="font-mono text-xl font-bold text-stone-900 tabular-nums">
              {formatINR(totalStoreRevenuePaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Role Governance & Permissions ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3.5 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Consultation Briefs & Projects ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3.5 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalogue & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Store Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3.5 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Demo Payment Log ({payments.length})</span>
        </button>
      </div>

      {/* Tab 1: Role Governance (Admin Only) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              User Role Governance & Privilege Assignment
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Only admins can grant Designer, Contractor, or Admin roles. New sign-ups start as Customers.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">User & Contact</th>
                    <th className="px-4 py-3">Registered Email</th>
                    <th className="px-4 py-3">Current Active Role</th>
                    <th className="px-4 py-3">Assign Privilege Role (Admin Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-stone-900 block">{u.display_name}</span>
                        <span className="text-[11px] text-stone-400">{u.phone || 'No phone recorded'}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-stone-600">
                        {u.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-stone-900 text-white'
                              : u.role === 'designer'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role === 'contractor'
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={u.role}
                          onChange={e => reportFailure(updateUserRole(u.id, e.target.value as UserRole))}
                          className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium cursor-pointer"
                        >
                          <option value="customer">Customer (Standard)</option>
                          <option value="designer">Interior Designer (Studio Lead)</option>
                          <option value="contractor">Contractor (Trade Execution)</option>
                          <option value="admin">Admin (Full Privilege)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Consultation Briefs & Projects Overview */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              Platform-Wide Consultation Briefs
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Review all client consultation requests and active architectural projects across the platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Brief Title</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Budget Window</th>
                    <th className="px-4 py-3">Assigned Designer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                        No consultation briefs registered yet.
                      </td>
                    </tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-stone-900">
                          {req.title}
                          <span className="block text-[10px] text-stone-400">{req.city} · {req.area_sqft} sq.ft</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-stone-900 block">{req.customer_name}</span>
                          <span className="text-[11px] text-stone-500">{req.customer_email}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-stone-800">
                          {formatINR(req.budget_min_paise)} – {formatINR(req.budget_max_paise)}
                        </td>
                        <td className="px-4 py-3.5 text-stone-600">
                          {req.assigned_designer_name || 'Studio Pool'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              req.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-800'
                                : req.status === 'meeting_scheduled'
                                ? 'bg-amber-100 text-amber-900 font-semibold'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {(req.status || 'submitted').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-400">
                          {formatDate(req.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                Home Décor Inventory Management
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Admin controls product availability, pricing in paise, and direct stock quantities.
              </p>
            </div>
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product Drawer */}
          {showAddProduct && (
            <form onSubmit={handleCreateProduct} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <div className="font-semibold text-xs uppercase tracking-wider text-stone-700">
                New Catalogue Item
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">SKU *</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={e => setNewSku(e.target.value)}
                    placeholder="e.g. IF-LT-007"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Product Title"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                  >
                    <option value="lighting">Lighting</option>
                    <option value="furniture">Furniture</option>
                    <option value="rugs">Rugs</option>
                    <option value="wall_decor">Wall Décor</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    value={newPriceRupees}
                    onChange={e => setNewPriceRupees(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Material</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    placeholder="e.g. Brushed Brass"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newDimensions}
                    onChange={e => setNewDimensions(e.target.value)}
                    placeholder="e.g. 40cm x 40cm"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Architectural product copy..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                >
                  Save Product to Catalogue
                </button>
              </div>
            </form>
          )}

          {/* Product Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">SKU & Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price (INR)</th>
                    <th className="px-4 py-3">Stock Count</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] text-stone-400 block">{prod.sku}</span>
                        <span className="font-semibold text-stone-900">{prod.name}</span>
                      </td>
                      <td className="px-4 py-3.5 capitalize text-stone-600">
                        {(prod.category || 'decor').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-stone-900 tabular-nums">
                        {formatINR(prod.price_paise)}
                      </td>
                      <td className="px-4 py-3.5">
                        {editingStockId === prod.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={tempStockValue}
                              onChange={e => setTempStockValue(Number(e.target.value))}
                              className="w-16 px-2 py-0.5 border border-stone-300 rounded font-mono text-xs"
                            />
                            <button
                              onClick={() => {
                                reportFailure(updateStock(prod.id, tempStockValue));
                                setEditingStockId(null);
                              }}
                              className="p-1 bg-stone-900 text-white rounded hover:bg-stone-800"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono tabular-nums font-semibold ${prod.stock_quantity <= 5 ? 'text-amber-800' : 'text-stone-900'}`}>
                              {prod.stock_quantity}
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(prod.id);
                                setTempStockValue(prod.stock_quantity);
                              }}
                              className="text-stone-400 hover:text-stone-700"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${prod.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                          {prod.is_active ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => reportFailure(updateProduct(prod.id, { is_active: !prod.is_active }))}
                          className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                        >
                          {prod.is_active ? 'Archive' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Orders & Fulfilment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              Store Orders & Dispatch Tracking
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Demo-payment orders snapshotting product unit price and quantities at checkout.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Number</th>
                    <th className="px-4 py-3">Customer & City</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total (Paise)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                        No store orders placed yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                          {order.order_number}
                          <span className="block text-[10px] text-stone-400 font-normal">{formatDate(order.created_at)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-stone-900 block">{order.customer_name}</span>
                          <span className="text-[11px] text-stone-500">{order.shipping_address.city}, {order.shipping_address.state}</span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-600">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              {it.quantity}x {it.product_name_snapshot}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-stone-900 tabular-nums">
                          {formatINR(order.total_paise)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              order.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-50 text-blue-800'
                                : order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={order.status}
                            onChange={e => reportFailure(updateOrderStatus(order.id, e.target.value as OrderStatus))}
                            className="px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 font-medium cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Demo Payment Log */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              Demo Payment Log
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Records of demo checkouts. No real money moved, and no gateway verified these.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Ref</th>
                    <th className="px-4 py-3">Payment Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Capture Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                          {p.order_number}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-stone-700">
                          {p.provider_payment_id}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-stone-900 tabular-nums">
                          {formatINR(p.amount_paise)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium capitalize text-stone-700">{p.provider}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 capitalize">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-400 font-mono text-[11px]">
                          {formatDate(p.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
