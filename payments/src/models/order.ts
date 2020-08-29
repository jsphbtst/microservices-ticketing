import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '@jsphbtst-tech/common'

// list of properties when building an order
interface OrderAttrs {
	id: string
	version: number
	userId: string
	price: number
	status: OrderStatus
}

// list of properties that an order has
interface OrderDoc extends mongoose.Document {
	version: number
	userId: string
	price: number
	status: OrderStatus
}

// list of properties that the model itself contains
interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true
		},
		status: {
			type: String,
			required: true
		}
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id
				delete ret._id
			}
		}
	}
)

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
	const { id, version, userId, price, status } = attrs
	return new Order({
		_id: id,
		version,
		userId,
		price,
		status
	})
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
