import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Modal } from '../../../components/Modal';
import { supabase } from '../../../main';

interface Order {
  id: string;
  project_id: string;
  work_date: string;
  team: string;
  exchange: string;
  order_number: string;
  contact: string;
  lo: string;
  service_identifier: string;
  order_type: string;
  block: string;
  road: string;
  building: string;
  flat: string;
  slot: string;
  package: string;
  cpr_cr: string;
  controller_remarks: string;
  appointment: string;
  task_created_at: string;
  order_created_at: string;
  connection_type: string;
  fttr_type: string;
  action: string;
  sub_root_cause: string;
  item_category: string;
  technician_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Technician {
  id: string;
  full_name: string;
  employee_code: string;
}

const Spreadsheet: React.FC = () => {
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>(null);
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const fetchOrders = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('work_date', { ascending: false });
    if (error) throw error;
    return data;
  };

  const fetchProjects = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data;
  };

  const fetchTechnicians = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician');
    if (error) throw error;
    return data;
  };

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { data: techniciansData, isLoading: isTechniciansLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: fetchTechnicians,
  });

  useEffect(() => {
    if (ordersData) setOrders(ordersData);
    if (projectsData) setProjects(projectsData);
    if (techniciansData) setTechnicians(techniciansData);
    setIsLoading(isOrdersLoading || isProjectsLoading || isTechniciansLoading);
  }, [ordersData, projectsData, techniciansData, isOrdersLoading, isProjectsLoading, isTechniciansLoading]);

  // Update mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase
        .from('orders')
        .update(order)
        .eq('id', order.id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: (updatedOrder) => {
      setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
      setDirtyRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedOrder.id);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    return (
      (searchTerm === '' ||
        Object.values(order).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (filterProject === '' || order.project_id === filterProject) &&
      (filterTechnician === '' || order.technician_id === filterTechnician) &&
      (filterAction === '' || order.action === filterAction)
    );
  });

  const sortedOrders = React.useMemo(() => {
    if (!sortConfig) return filteredOrders;
    return [...filteredOrders].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || bVal === null) return 0;

      if (aVal < bVal) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredOrders, sortConfig]);

  const requestSort = (key: keyof Order) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleCellChange = (orderId: string, field: keyof Order, value: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, [field]: value } : order
      )
    );
    setDirtyRows(prev => new Set(prev).add(orderId));
  };

  const handleSaveChanges = () => {
    dirtyRows.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        updateOrderMutation.mutate(order);
      }
    });
  };

  const handleRowSelect = (orderId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleAssignTechnician = (technicianId: string) => {
    if (selectedRows.size === 0) return;

    selectedRows.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        updateOrderMutation.mutate({ ...order, technician_id: technicianId });
      }
    });

    setSelectedRows(new Set());
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Orders Spreadsheet</h2>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={dirtyRows.size === 0}
          >
            Save Changes ({dirtyRows.size})
          </Button>
          <Select
            label="Assign Technician"
            options={[
              { value: '', label: 'Select Technician' },
              ...technicians.map(t => ({ value: t.id, label: t.full_name }))
            ]}
            onChange={(e) => handleAssignTechnician(e.target.value)}
            disabled={selectedRows.size === 0}
          />
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
        <Input
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders..."
        />
        <Select
          label="Project"
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map(p => ({ value: p.id, label: p.name }))
          ]}
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        />
        <Select
          label="Technician"
          options={[
            { value: '', label: 'All Technicians' },
            ...technicians.map(t => ({ value: t.id, label: t.full_name }))
          ]}
          value={filterTechnician}
          onChange={(e) => setFilterTechnician(e.target.value)}
        />
        <Select
          label="Action"
          options={[
            { value: '', label: 'All Actions' },
            { value: 'Delivered', label: 'Delivered' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto" ref={tableRef}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedOrders.length && sortedOrders.length > 0}
                  onChange={() => {
                    if (selectedRows.size === sortedOrders.length) {
                      setSelectedRows(new Set());
                    } else {
                      setSelectedRows(new Set(sortedOrders.map(order => order.id)));
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </th>
              {Object.keys(sortedOrders[0] || {}).map((key) => (
                <th
                  key={key}
                  onClick={() => requestSort(key as keyof Order)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${
                    sortConfig?.key === key ? 'bg-gray-200' : ''
                  }`}
                >
                  {key.replace('_', ' ')}
                  {sortConfig?.key === key && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <tr
                key={order.id}
                className={`hover:bg-gray-50 ${
                  dirtyRows.has(order.id) ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(order.id)}
                    onChange={() => handleRowSelect(order.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                {Object.entries(order).map(([key, value]) => (
                  <td
                    key={key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      dirtyRows.has(order.id) ? 'text-yellow-600' : 'text-gray-500'
                    }`}
                    onClick={() => handleEditOrder(order)}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={`Edit Order #${selectedOrder.order_number}`}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedOrder).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace('_', ' ')}
                </label>
                <Input
                  value={value || ''}
                  onChange={(e) => handleCellChange(selectedOrder.id, key as keyof Order, e.target.value)}
                  disabled={key === 'id' || key === 'created_at' || key === 'updated_at'}
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Spreadsheet;