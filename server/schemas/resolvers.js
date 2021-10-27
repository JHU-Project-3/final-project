const { AuthenticationError } = require("apollo-server-express");
const { User, Event, Category, Product, Order } = require("../models");
const { signToken } = require("../utils/auth");
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

const resolvers = {
	Query: {
		categories: async () => {
			return await Category.find();
		},
		products: async (parent, { category, name }) => {
			const params = {};

			if (category) {
				params.category = category;
			}

			if (name) {
				params.name = {
					$regex: name,
				};
			}

			return await Product.find(params).populate("category");
		},
		product: async (parent, { _id }) => {
			return await Product.findById(_id).populate("category");
		},
		order: async (parent, { _id }, context) => {
			if (context.user) {
				const user = await User.findById(context.user._id).populate({
					path: "orders.products",
					populate: "category",
				});

				return user.orders.id(_id);
			}

			throw new AuthenticationError("Not logged in");
		},
		checkout: async (parent, args, context) => {
			const url = new URL(context.headers.referer).origin;
			const order = new Order({ products: args.products });
			const line_items = [];

			const { products } = await order
				.populate("products")
				.execPopulate();

			for (let i = 0; i < products.length; i++) {
				const product = await stripe.products.create({
					name: products[i].name,
					description: products[i].description,
					images: [`${url}/images/${products[i].image}`],
				});

				const price = await stripe.prices.create({
					product: product.id,
					unit_amount: products[i].price * 100,
					currency: "usd",
				});

				line_items.push({
					price: price.id,
					quantity: 1,
				});
			}

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				line_items,
				mode: "payment",
				success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url}/`,
			});

			return { session: session.id };
		},
		user: async (parent, { username }) => {
			return User.findOne({ username }).populate("events").populate({
				path: "orders.products",
				populate: "category",
			});
			user.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

			return user;
		},

		me: async (parent, args, context) => {
			if (context.user) {
				return await User.findOne({ _id: context.user._id });
			}
			throw new AuthenticationError("You need to be logged in!");
		},
		events: async (parent, args, context) => {
			return Event.find().populate("user");
		},
	},

	Mutation: {
		addEvent: async (
			parent,
			{ eventTitle, eventDescription, eventLink },
			context
		) => {
			if (context.user) {
				const event = await Event.create({
					eventTitle,
					eventDescription,
					eventLink,
					user: context.user._id,
				});
				await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $addToSet: { events: event._id } }
				);
				return event;
			}
			throw new AuthenticationError("You need to be logged in!");
		},

		addUser: async (parent, { name, username, email, password }) => {
			const user = await User.create({ name, username, email, password });
			const token = signToken(user);
			return { token, user };
		},
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError(
					"No user found with this email address"
				);
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError("Incorrect credentials");
			}

			const token = signToken(user);

			return { token, user };
		},
		addOrder: async (parent, { products }, context) => {
			console.log(context);
			if (context.user) {
				const order = new Order({ products });

				await User.findByIdAndUpdate(context.user._id, {
					$push: { orders: order },
				});

				return order;
			}

			throw new AuthenticationError("Not logged in");
		},
		updateUser: async (parent, args, context) => {
			if (context.user) {
				return await User.findByIdAndUpdate(context.user._id, args, {
					new: true,
				});
			}

			throw new AuthenticationError("Not logged in");
		},
		updateProduct: async (parent, { _id, quantity }) => {
			const decrement = Math.abs(quantity) * -1;

			return await Product.findByIdAndUpdate(
				_id,
				{ $inc: { quantity: decrement } },
				{ new: true }
			);
		},
		// addComment: async (
		// 	parent,
		// 	{ thoughtId, commentText, commentAuthor }
		// ) => {
		// 	return Thought.findOneAndUpdate(
		// 		{ _id: thoughtId },
		// 		{
		// 			$addToSet: { comments: { commentText, commentAuthor } },
		// 		},
		// 		{
		// 			new: true,
		// 			runValidators: true,
		// 		}
		// 	);
		// },
	},
};
module.exports = resolvers;
