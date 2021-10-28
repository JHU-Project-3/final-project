import { gql } from "@apollo/client";

export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      name
      username
      email
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
      username
      email
      events {
        _id
        eventTitle
        eventDescription
      }
    }
  }
`;

export const QUERY_EVENTS = gql`
  query events {
    events {
      _id
      eventTitle
      eventDescription
      eventLink
      eventDate
      createdAt
      isPublished
      isPremiumContent
      comments {
        commentText
      }
      user {
        _id
        name
        email
        username
      }
    }
  }
`;
export const QUERY_SINGLE_EVENT = gql`
  query getSingleEvent($eventId: ID!) {
    event(eventId: $eventId) {
      _id
      eventTitle
      eventDescription
      eventDate
      createdAt
      isPublished
      isPremiumContent
      comments {
        _id
        commentText
        createdAt
      }
    }
  }
`;

export const QUERY_PRODUCTS = gql`
  query getProducts($category: ID) {
    products(category: $category) {
      _id
      name
      description
      price
      quantity
      image
      category {
        _id
      }
    }
  }
`;

export const QUERY_CHECKOUT = gql`
  query getCheckout($products: [ID]!) {
    checkout(products: $products) {
      session
    }
  }
`;

export const QUERY_ALL_PRODUCTS = gql`
  {
    products {
      _id
      name
      description
      price
      quantity
      category {
        name
      }
    }
  }
`;

export const QUERY_CATEGORIES = gql`
  {
    categories {
      _id
      name
    }
  }
`;
