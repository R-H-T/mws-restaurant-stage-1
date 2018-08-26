
class Review {
  constructor(
    id = null,
    name = null,
    rating = 0,
    createdAt = Date.now(), // The actual date for new reviews will be set on the backend.
    email = null,
    comments = null,
    restaurant_id = null
  ) {
    this.id = id;
    this.name = name;
    this.restaurant_id = restaurant_id;
    this.rating = rating;
    this.createdAt = createdAt;
    this.email = email;
    this.comments= comments;
  }
}

export default Review;
