// src/modules/products/product.controller.ts
import { Elysia } from 'elysia';
import { productService } from '../services/AddProduct';
import { CreateProductInput } from '../prisma/schemas';
// Не імпортуємо схему валідації

export const AddProductRoutes = new Elysia()
    .post(
        '/addNewProduct',
        async ({ body, set }) => {
            try {

                const newProduct = await productService.createProductWithRelations(body as CreateProductInput);

                set.status = 201;
                return {
                    message: 'Product created successfully!',
                    product: newProduct,
                };

            } catch (error: unknown) {
                console.error("Error in POST /products:", error);
            }
        },
        {
            detail: {
                summary: 'Create a new product with relations (custom validation assumed)',
                tags: ['Products']
            }
        }
    )
    .post(
        '/updateNewProduct',
        async (context) => {
            const { set } = context
            const data = context.body as CreateProductInput
            try {

                if (data.id === undefined) {
                    set.status = 400;
                    return { message: 'Product ID is required' };
                }

                const newProduct = await productService.updateProductWithRelations(data.id, data);
                set.status = 201;
                return {
                    message: 'Product created successfully!',
                    product: newProduct,
                };

            } catch (error: unknown) {
                console.error("Error in POST /updateProducts:", error);
            }
        },
        {
            detail: {
                summary: 'Create a new product with relations (custom validation assumed)',
                tags: ['Products']
            }
        }
    );
// ... інші роути