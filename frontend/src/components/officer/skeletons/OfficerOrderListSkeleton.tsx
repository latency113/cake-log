import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import  Skeleton  from '../../common/SkeletonLoader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const OfficerOrderListSkeleton: React.FC = () => {
  return (
    <div className="p-4">
      {/* Title Skeleton */}
      <Skeleton className="h-8 w-1/3 mb-4" />

      {/* Department Filter Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-10 w-[200px]" />
      </div>

      {/* Branch Statistics Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order List Table Skeleton (simplified) */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerOrderListSkeleton;