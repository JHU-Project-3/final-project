const { AuthenticationError } = require("apollo-server-express");
const { User, Event, Category } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
	Query: {
		// users: async () => {
		// 	return User.find().populate("thoughts");
		// },
		user: async (parent, { username }) => {
			return User.findOne({ username });
		},
		me: async (parent, context) => {
			if (context.user) {
			  return User.findOne({ _id: context.user._id }).populate('events');
			}
			throw new AuthenticationError('You need to be logged in!');
		  },
		  event: async (parent, { _id: eventId }) => {
			return Event.findOne({ _id: eventId });
		},
	},

	Mutation: {
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