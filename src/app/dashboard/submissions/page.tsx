'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Contractor {
  id: string;
  name: string;
  contact_email: string;
  tenant_id: string;
  contact_phone?: string;
}

interface FRM32Submission {
  id: string;
  contractor_id: string;
  status: 'draft' | 'submitted' | 'pending' | 'reviewed';
  progress_percentage: number;
  submitted_at?: string;
  evaluation_period: string;
  attachments: any[];
}

interface SubmissionRow {
  contractor: Contractor;
  frm32: FRM32Submission | null;
  frm33Status?: string;
  frm34Status?: string;
  frm35Status?: string;
}

export default function SubmissionsPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { hasPermission, isLoading: permissionsLoading } =
    usePermissionContext();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = profile?.tenant_id;
  const isSupervisor = profile?.role_id === 5; // Supervisor role
  const isContractor = profile?.role_id === 4; // Contractor role
  // Allow access if user has access to EvrenGPT module
  const hasAccess = hasPermission('modules.access_evren_gpt');

  useEffect(() => {
    if (profileLoading || permissionsLoading) {
      return;
    }

    if (!tenantId || !hasAccess) {
      setError('Unauthorized access');
      setIsLoading(false);
      return;
    }

    loadSubmissions();
  }, [
    tenantId,
    hasAccess,
    profileLoading,
    permissionsLoading,
    isSupervisor,
    isContractor,
    profile?.contractor_id
  ]);

  async function loadSubmissions() {
    try {
      setIsLoading(true);
      setError(null);

      let submissionsData: FRM32Submission[] = [];
      let contractorsList: Contractor[] = [];

      if (isSupervisor) {
        // Supervisors: Show ALL contractors and their latest FRM32 progress
        const contractors = await apiClient.get<Contractor[]>(
          `/contractors?limit=100`,
          { tenantId: tenantId! }
        );
        contractorsList = Array.isArray(contractors) ? contractors : [];

        const allSubmissions = await apiClient.get<FRM32Submission[]>(
          `/frm32/submissions?limit=100`,
          { tenantId: tenantId! }
        );
        console.log(
          '[Submissions] Fetched submissions for supervisor:',
          allSubmissions
        );
        submissionsData = Array.isArray(allSubmissions) ? allSubmissions : [];
      } else if (isContractor && profile?.contractor_id) {
        // Contractors: Show only their own contractor record and draft FRM32
        const contractorData = await apiClient.get<Contractor>(
          `/contractors/${profile.contractor_id}`,
          { tenantId: tenantId! }
        );
        contractorsList = contractorData ? [contractorData] : [];

        // Fetch contractor's own submission (draft status)
        const submissions = await apiClient.get<FRM32Submission[]>(
          `/frm32/submissions?contractor_id=${profile.contractor_id}&limit=100`,
          { tenantId: tenantId! }
        );
        submissionsData = Array.isArray(submissions) ? submissions : [];
      } else {
        // Fallback: Show all contractors and all submissions
        const contractors = await apiClient.get<Contractor[]>(
          `/contractors?limit=100`,
          { tenantId: tenantId! }
        );
        contractorsList = Array.isArray(contractors) ? contractors : [];

        const submissions = await apiClient.get<FRM32Submission[]>(
          `/frm32/submissions?limit=100`,
          { tenantId: tenantId! }
        );
        submissionsData = Array.isArray(submissions) ? submissions : [];
      }

      // Build submission rows
      const rows: SubmissionRow[] = contractorsList.map(
        (contractor: Contractor) => {
          const frm32 =
            submissionsData.find(
              (s: FRM32Submission) => s.contractor_id === contractor.id
            ) || null;

          return {
            contractor,
            frm32,
            frm33Status: frm32?.status === 'submitted' ? 'available' : 'locked',
            frm34Status: frm32?.status === 'submitted' ? 'available' : 'locked',
            frm35Status: frm32?.status === 'submitted' ? 'available' : 'locked'
          };
        }
      );

      setSubmissions(rows);
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant='outline'>Not Started</Badge>;

    switch (status) {
      case 'draft':
        return (
          <Badge variant='secondary'>
            <Clock className='mr-1 h-3 w-3' />
            Draft
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant='default'>
            <CheckCircle className='mr-1 h-3 w-3' />
            Submitted
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant='default' className='bg-green-600'>
            <CheckCircle className='mr-1 h-3 w-3' />
            Reviewed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getFormStatusBadge = (status: string) => {
    if (status === 'locked') {
      return (
        <Badge variant='outline' className='bg-gray-100'>
          Locked
        </Badge>
      );
    }
    return <Badge variant='secondary'>Available</Badge>;
  };

  if (!hasAccess && !profileLoading && !permissionsLoading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <div className='text-destructive'>
            You do not have permission to view this page
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Submissions</h1>
          <p className='text-muted-foreground mt-2'>
            Monitor contractor form submissions and manage evaluation forms
          </p>
        </div>

        {error && (
          <div className='bg-destructive/10 border-destructive/20 rounded-lg border p-4'>
            <p className='text-destructive text-sm'>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <div className='text-muted-foreground'>Loading submissions...</div>
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>FRM32 Status</TableHead>
                  <TableHead className='text-center'>Progress</TableHead>
                  <TableHead>FRM33</TableHead>
                  <TableHead>FRM34</TableHead>
                  <TableHead>FRM35</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No contractors found
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((row) => (
                    <TableRow
                      key={row.contractor.id}
                      className='hover:bg-muted/50'
                    >
                      <TableCell className='font-medium'>
                        {row.contractor.name}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {row.contractor.contact_email}
                      </TableCell>
                      <TableCell>{getStatusBadge(row.frm32?.status)}</TableCell>
                      <TableCell>
                        <div className='flex items-center justify-center gap-2'>
                          <Progress
                            value={row.frm32?.progress_percentage ?? 0}
                            className='w-16'
                          />
                          <span className='w-8 text-xs font-medium'>
                            {row.frm32?.progress_percentage ?? 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getFormStatusBadge(row.frm33Status || 'locked')}
                      </TableCell>
                      <TableCell>
                        {getFormStatusBadge(row.frm34Status || 'locked')}
                      </TableCell>
                      <TableCell>
                        {getFormStatusBadge(row.frm35Status || 'locked')}
                      </TableCell>
                      <TableCell className='space-x-2 text-right'>
                        {/* Contractors: Can only view their own draft FRM32 */}
                        {isContractor &&
                          row.frm32?.status === 'draft' &&
                          row.frm32?.id && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                router.push(
                                  `/dashboard/evren-gpt/frm32?submission=${row.frm32?.id}`
                                );
                              }}
                            >
                              <FileText className='mr-1 h-3 w-3' />
                              Edit FRM32
                            </Button>
                          )}

                        {/* Supervisors: Can only access FRM33/34/35 for SUBMITTED FRM32s */}
                        {isSupervisor &&
                          row.frm32?.status === 'submitted' &&
                          row.frm32?.id && (
                            <Button
                              size='sm'
                              variant='secondary'
                              onClick={() => {
                                router.push(
                                  `/dashboard/evren-gpt/frm32?submission=${row.frm32?.id}`
                                );
                              }}
                            >
                              <FileText className='mr-1 h-3 w-3' />
                              View FRM32
                            </Button>
                          )}

                        {isSupervisor && row.frm32?.status === 'submitted' && (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                router.push(
                                  `/dashboard/evren-gpt/frm33?submission=${row.frm32?.id}`
                                );
                              }}
                            >
                              <ArrowRight className='mr-1 h-3 w-3' />
                              FRM33
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                router.push(
                                  `/dashboard/evren-gpt/frm34?submission=${row.frm32?.id}`
                                );
                              }}
                            >
                              <ArrowRight className='mr-1 h-3 w-3' />
                              FRM34
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                router.push(
                                  `/dashboard/evren-gpt/frm35?submission=${row.frm32?.id}`
                                );
                              }}
                            >
                              <ArrowRight className='mr-1 h-3 w-3' />
                              FRM35
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
