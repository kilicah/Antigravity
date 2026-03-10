import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateOrder() {
  try {
    const id = 2; // Testing with order ID 2
    
    // get order data first
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        productionOrder: true,
        invoice: true
      }
    });
    
    if (!order) {
      console.log('Order not found');
      return;
    }
    
    console.log('Order found, trying to update...');
    
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      });

      return await tx.order.update({
        where: { id },
        data: {
          contractDate: order.contractDate,
          buyerPoNo: order.buyerPoNo,
          sellerId: order.sellerId,
          buyerId: order.buyerId,
          shipToId: order.shipToId,
          brandId: order.brandId,
          sellerRepId: order.sellerRepId,
          buyerRepId: order.buyerRepId,
          deliveryTerms: order.deliveryTerms,
          paymentTerms: order.paymentTerms,
          transporter: order.transporter,
          currency: order.currency,
          tolerance: order.tolerance,
          
          items: {
            create: order.items.map((item: any) => ({
              ...item,
              id: undefined,
              orderId: undefined
            }))
          },
          productionOrder: {
            upsert: {
              create: {
                packingInstructions: order.productionOrder?.packingInstructions || null,
              },
              update: {
                packingInstructions: order.productionOrder?.packingInstructions || null,
              }
            }
          },
          invoice: {
            upsert: {
              create: {
                invoiceNo: order.invoice?.invoiceNo || null,
              },
              update: {
                invoiceNo: order.invoice?.invoiceNo || null,
              }
            }
          }
        }
      });
    });
    
    console.log('Update success');
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrder();
