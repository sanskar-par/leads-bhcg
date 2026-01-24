"use client";

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { addLead, checkDuplicateLead, industries, roleTypes } from '@/lib/data-supabase';
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').min(1, 'LinkedIn URL is required'),
  name: z.string().min(1, 'Name is required'),
  latestCompany: z.string().min(1, 'Company is required'),
  roleType: z.string().min(1, 'Role type is required'),
  industry: z.string().min(1, 'Industry is required'),
  email: z.string().email('Invalid email address'),
  alternateEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  isBitsian: z.boolean().default(false),
  remarks: z.string().optional(),
});

type AddLeadFormProps = {
  onLeadAdded: () => void;
};

export default function AddLeadForm({ onLeadAdded }: AddLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedinUrl: '',
      name: '',
      latestCompany: '',
      roleType: '',
      industry: '',
      email: '',
      alternateEmail: '',
      phoneNumber: '',
      isBitsian: false,
      remarks: '',
    },
  });

  // Check for duplicates when LinkedIn URL or email changes (with debounce)
  const checkForDuplicates = useCallback(async (linkedinUrl: string, email: string) => {
    // Clear any pending timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    setDuplicateError(null);
    
    // Don't check if both fields are empty or don't have valid values
    const hasValidLinkedIn = linkedinUrl && linkedinUrl.trim().length > 0 && linkedinUrl.startsWith('http');
    const hasValidEmail = email && email.trim().length > 0 && email.includes('@');
    
    if (!hasValidLinkedIn && !hasValidEmail) {
      setIsCheckingDuplicate(false);
      return;
    }

    // Debounce the check - wait 500ms after user stops typing
    const timeout = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const duplicate = await checkDuplicateLead(
          hasValidLinkedIn ? linkedinUrl : undefined, 
          hasValidEmail ? email : undefined
        );
        if (duplicate) {
          const duplicateField = hasValidLinkedIn && duplicate.linkedinUrl === linkedinUrl ? 'LinkedIn URL' : 'Email';
          setDuplicateError(`This ${duplicateField} already exists in the database (Lead: ${duplicate.name} at ${duplicate.latestCompany})`);
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 500);

    setCheckTimeout(timeout);
  }, [checkTimeout]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication error", description: "You must be logged in to add a lead." });
        return;
    }

    // Final duplicate check before submission
    const duplicate = await checkDuplicateLead(values.linkedinUrl, values.email);
    if (duplicate) {
      const duplicateField = duplicate.linkedinUrl === values.linkedinUrl ? 'LinkedIn URL' : 'Email';
      toast({ 
        variant: "destructive", 
        title: "Duplicate Lead", 
        description: `This ${duplicateField} already exists in the database (${duplicate.name} at ${duplicate.latestCompany})` 
      });
      return;
    }

    setIsSubmitting(true);
    try {
        await addLead({ ...values, addedBy: user.id });
        toast({ title: "Lead Added", description: `${values.name} has been added to the database.` });
        form.reset();
        setDuplicateError(null);
        onLeadAdded();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to add lead." });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add to Database</CardTitle>
        <CardDescription>Enter lead details manually.</CardDescription>
      </CardHeader>
      <CardContent>
            {duplicateError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm border border-destructive/30">
                {duplicateError}
              </div>
            )}
            {isCheckingDuplicate && (
              <div className="mb-4 p-3 rounded-md bg-blue-50 text-blue-700 text-sm border border-blue-200 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking for duplicates...
              </div>
            )}
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. https://www.linkedin.com/in/johndoe" 
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            checkForDuplicates(field.value, form.getValues('email'));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="latestCompany" render={({ field }) => (
                    <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g. Acme Corp" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="roleType" render={({ field }) => (
                    <FormItem><FormLabel>Role Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role type" /></SelectTrigger></FormControl>
                            <SelectContent>{roleTypes.map(rt => <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem><FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl>
                            <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="e.g. john.doe@example.com" 
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            checkForDuplicates(form.getValues('linkedinUrl'), field.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="alternateEmail" render={({ field }) => (
                    <FormItem><FormLabel>Alternate Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="e.g. john.d@personal.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="e.g. +1 123 456 7890" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="isBitsian" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none"><FormLabel>BITSIAN</FormLabel></div>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="remarks" render={({ field }) => (
                    <FormItem><FormLabel>Remarks (Optional)</FormLabel><FormControl><Input placeholder="Additional notes..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <CardFooter className="p-0 pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting || isCheckingDuplicate || !!duplicateError}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding Lead...
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Lead
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
            </Form>
      </CardContent>
    </Card>
  );
}
