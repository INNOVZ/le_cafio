'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { DashboardCategoryFormValues } from '@/lib/db-actions';
import { createCategory, updateCategory } from '@/lib/db-actions';
import { useCategoryStore } from '@/store/category-store';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Category name must be at least 3 characters.')
    .max(32, 'Category name must be at most 32 characters.'),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialValues?: DashboardCategoryFormValues;
};

function getDefaultValues(initialValues?: DashboardCategoryFormValues): FormValues {
  return {
    name: initialValues?.name ?? '',
    sortOrder: initialValues?.sortOrder ?? 0,
    isActive: initialValues?.isActive ?? true,
    image: undefined,
  };
}

export default function CategoryForm({
  mode,
  initialValues,
}: CategoryFormProps) {
  const {
    isSubmitting,
    setSubmitting,
    setSubmitError,
    setSubmitSuccess,
    resetState,
  } = useCategoryStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialValues));
  }, [form, initialValues]);

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('sortOrder', String(data.sortOrder));
      formData.append('isActive', String(data.isActive));

      if (mode === 'edit' && initialValues?.id) {
        formData.append('id', initialValues.id);
      }

      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const result =
        mode === 'edit'
          ? await updateCategory({ error: null, success: false }, formData)
          : await createCategory({ error: null, success: false }, formData);

      if (result.error) {
        setSubmitError(result.error);
        toast.error(result.error, { position: 'bottom-right' });
      } else {
        setSubmitSuccess(true);
        toast.success(
          mode === 'edit'
            ? 'Category updated successfully!'
            : 'Category added successfully!',
          {
            position: 'bottom-right',
          }
        );
        form.reset(getDefaultValues(initialValues));
        resetState();
      }
    } catch (err) {
      const message = 'An unexpected error occurred. Please try again.';
      setSubmitError(message);
      toast.error(message, { position: 'bottom-right' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const formId =
    mode === 'edit' ? 'form-edit-category' : 'form-add-category';

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          {mode === 'edit' ? 'Edit Category' : 'Add new Category'}
        </h1>
      </div>

      <div className="mt-6 rounded-3xl border p-5">
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-name`}>
                    Category Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-name`}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Hot Coffee..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="sortOrder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-sort-order`}>
                    Sort Order
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-sort-order`}
                    type="number"
                    min="0"
                    step="1"
                    aria-invalid={fieldState.invalid}
                    placeholder="0"
                    autoComplete="off"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : e.target.valueAsNumber
                      )
                    }
                  />
                  <FieldDescription>
                    Determines the display order (0 is first).
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {initialValues?.imageUrl ? (
              <Field>
                <FieldLabel>Current Image</FieldLabel>
                <div className="relative h-24 w-24 overflow-hidden">
                  <Image
                    src={initialValues.imageUrl}
                    alt={initialValues.name}
                    width={24}
                    height={24}
                    sizes="56px"
                    className="h-24 w-24"
                  />
                </div>
              </Field>
            ) : null}

            <Controller
              name="image"
              control={form.control}
              render={({
                field: { ref, name, onBlur, onChange },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-image`}>
                    Category Image
                  </FieldLabel>
                  <Input
                    ref={ref}
                    name={name}
                    onBlur={onBlur}
                    id={`${formId}-image`}
                    type="file"
                    accept="image/*"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) =>
                      onChange(event.target.files && event.target.files[0])
                    }
                  />
                  <FieldDescription>
                    {mode === 'edit'
                      ? 'Upload a new image only if you want to replace the current one.'
                      : 'Upload a category image (optional).'}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={`${formId}-active`}>
                      Active
                    </FieldLabel>
                    <FieldDescription>
                      This category will be available in the store.
                    </FieldDescription>
                  </div>
                  <Switch
                    id={`${formId}-active`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>

      <div className="p-5">
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              form.reset(getDefaultValues(initialValues));
              resetState();
            }}
          >
            Reset
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : mode === 'edit' ? (
              'Update Category'
            ) : (
              'Submit'
            )}
          </Button>
        </Field>
      </div>
    </div>
  );
}
