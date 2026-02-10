import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Reviews = ({ reviews: apiReviews = [] }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most-recent');
  const [reviewsToShow, setReviewsToShow] = useState(4);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (apiReviews && apiReviews.length > 0) {
      const formatted = apiReviews.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        customerImage: r.customer_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer_name)}&background=random`,
        isVerifiedPurchase: r.is_verified,
        rating: r.rating,
        title: r.title,
        review: r.review_text,
        date: new Date(r.review_date || r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        productName: r.product_name || 'Generic Product',
        productImage: r.product_image || '/placeholder.jpg',
        size: "One Size",
        color: "Default",
        helpfulVotes: r.helpful_votes || 0,
        totalVotes: r.total_votes || 0,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [])
      }));
      setReviews(formatted);
    } else {
      setReviews([]);
    }
  }, [apiReviews]);

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews)
    : 0;

  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  // Filter and sort reviews
  const getFilteredReviews = () => {
    let filtered = reviews;

    if (selectedFilter !== 'all') {
      filtered = reviews.filter(review => review.rating === parseInt(selectedFilter));
    }

    switch (sortBy) {
      case 'most-recent':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'highest-rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-rating':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'most-helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
      default:
        break;
    }

    return filtered.slice(0, reviewsToShow);
  };

  const filteredReviews = getFilteredReviews();
  const allFilteredReviews = (() => {
    let filtered = reviews;
    if (selectedFilter !== 'all') {
      filtered = reviews.filter(review => review.rating === parseInt(selectedFilter));
    }
    return filtered;
  })();

  const loadMoreReviews = () => {
    setReviewsToShow(prev => prev + 5);
  };

  const hasMoreReviews = reviewsToShow < allFilteredReviews.length;

  // Render star rating
  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`${size} ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-brand-primary mb-8">Customer Reviews</h2>

          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Overall Rating */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                  {renderStars(Math.round(averageRating), 'w-6 h-6')}
                  <span className="text-2xl font-bold text-brand-primary ml-2">
                    {averageRating.toFixed(1)} out of 5
                  </span>
                </div>
                <p className="text-gray-600">{totalReviews} global ratings</p>
              </div>

              {/* Rating Breakdown */}
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedFilter(star.toString());
                          setReviewsToShow(4);
                        }}
                        className="flex items-center space-x-1 text-sm text-brand-accent hover:text-brand-primary transition-colors duration-200"
                      >
                        <span>{star} star</span>
                      </button>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${totalReviews > 0 ? (ratingBreakdown[star] / totalReviews) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {totalReviews > 0 ? Math.round((ratingBreakdown[star] / totalReviews) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
            <div className="flex flex-wrap items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setReviewsToShow(4);
                }}
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${selectedFilter === 'all'
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                All reviews
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setSelectedFilter(star.toString());
                    setReviewsToShow(4);
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${selectedFilter === star.toString()
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {star} stars
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value="most-recent">Most recent</option>
                <option value="oldest">Oldest</option>
                <option value="highest-rating">Highest rating</option>
                <option value="lowest-rating">Lowest rating</option>
                <option value="most-helpful">Most helpful</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row lg:space-x-6">

                {/* Product Image */}
                <div className="flex-shrink-0 mb-4 lg:mb-0">
                  <Link href={`/product/${review.id}`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200">
                      <Image
                        src={review.customerImage}
                        alt={review.productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  {/* Customer Info and Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                      {review.isVerifiedPurchase && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">{review.date}</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mb-3">
                    <Link href={`/product/${review.id}`} className="text-brand-accent hover:text-brand-primary text-sm">
                      {review.productName}
                    </Link>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>Size: {review.size}</span>
                      <span>Color: {review.color}</span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h5 className="font-semibold text-brand-primary mb-2">{review.title}</h5>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.images.map((image, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={image}
                            alt={`Review image ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Votes */}
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      {review.helpfulVotes} of {review.totalVotes} people found this helpful
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-brand-accent hover:text-brand-primary transition-colors duration-200">
                        Helpful
                      </button>
                      <span className="text-gray-400">|</span>
                      <button className="text-brand-accent hover:text-brand-primary transition-colors duration-200">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreReviews && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreReviews}
              className="px-8 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-primary transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Load More Reviews ({allFilteredReviews.length - reviewsToShow} remaining)
            </button>
          </div>
        )}

        {/* Review Summary Stats */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {totalReviews > 0 ? Math.round((ratingBreakdown[5] / totalReviews) * 100) : 0}%
              </div>
              <p className="text-gray-600 text-sm">5-star reviews</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {reviews.filter(r => r.isVerifiedPurchase).length}
              </div>
              <p className="text-gray-600 text-sm">Verified purchases</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {averageRating.toFixed(1)}
              </div>
              <p className="text-gray-600 text-sm">Average rating</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-primary mb-1">
                {reviews.filter(r => r.images && r.images.length > 0).length}
              </div>
              <p className="text-gray-600 text-sm">Reviews with photos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews; 