import React from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ProductionTestSuite } from '@/components/test/ProductionTestSuite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          <TabsTrigger value="testing">Production Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admin">
          <AdminPanel />
        </TabsContent>
        
        <TabsContent value="testing">
          <ProductionTestSuite />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;