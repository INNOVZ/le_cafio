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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  CategoryOption,
  DashboardProductFormValues,
} from '@/lib/db-actions';
import { createProduct, updateProduct } from '@/lib/db-actions';
import { useProductStore } from '@/store/product-store';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Product title must be at least 5 characters.')
    .max(32, 'Product title must be at most 32 characters.'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(200, 'Description must be at most 200 characters.'),
  price: z.number().min(0, 'Price must be at least 0.'),
  categoryId: z.string().min(1, 'Please select a category.'),
  isAvailable: z.boolean(),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  mode: 'create' | 'edit';
  categories: CategoryOption[];
  initialValues?: DashboardProductFormValues;
};

function getDefaultValues(initialValues?: DashboardProductFormValues): FormValues {
  return {
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? 0,
    categoryId: initialValues?.categoryId ?? '',
    isAvailable: initialValues?.isAvailable ?? true,
    image: undefined,
  };
}

export default function ProductForm({
  mode,
  categories,
  initialValues,
}: ProductFormProps) {
  const {
    isSubmitting,
    setSubmitting,
    setSubmitError,
    setSubmitSuccess,
    resetState,
  } = useProductStore();

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
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('categoryId', data.categoryId);
      formData.append('isAvailable', String(data.isAvailable));

      if (mode === 'edit' && initialValues?.id) {
        formData.append('id', initialValues.id);
      }

      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const result =
        mode === 'edit'
          ? await updateProduct({ error: null, success: false }, formData)
          : await createProduct({ error: null, success: false }, formData);

      if (result.error) {
        setSubmitError(result.error);
        toast.error(result.error, { position: 'bottom-right' });
      } else {
        setSubmitSuccess(true);
        toast.success(
          mode === 'edit'
            ? 'Product updated successfully!'
            : 'Product added successfully!',
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

  const formId = mode === 'edit' ? 'form-edit-product' : 'form-add-product';

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          {mode === 'edit' ? 'Edit Product' : 'Add new Product'}
        </h1>
      </div>

      <div className="mt-6 rounded-3xl border p-5">
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-title`}>
                    Product Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-title`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Add Product name..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-description`}>
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id={`${formId}-description`}
                      placeholder="Please add the product description..."
                      rows={3}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length || 0}/200 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Provide a detailed description of the product features and
                    specifications.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-price`}>
                    Product Price (€)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-price`}
                    type="number"
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                    placeholder="0.00"
                    autoComplete="off"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : e.target.valueAsNumber
                      )
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-category`}>
                    Category
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={`${formId}-category`}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No categories found
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                    alt={initialValues.title}
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
                    Product Image
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
                      : 'Upload a product image (required).'}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isAvailable"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={`${formId}-available`}>
                      Available
                    </FieldLabel>
                    <FieldDescription>
                      This product will appear in the store.
                    </FieldDescription>
                  </div>
                  <Switch
                    id={`${formId}-available`}
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
              'Update Product'
            ) : (
              'Submit'
            )}
          </Button>
        </Field>
      </div>
    </div>
  );
}
