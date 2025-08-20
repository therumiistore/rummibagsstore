import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Reviews = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most-recent');
  const [reviewsToShow, setReviewsToShow] = useState(4);

  // Product reviews data for Rumiistore bag products (27 reviews for 4.8 rating)
  const reviews = [
    {
      id: 1,
      customerName: "Fatima A.",
      customerImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Absolutely stunning leather handbag!",
      review: "This classic leather handbag exceeded my expectations. The leather quality is exceptional and the craftsmanship is absolutely beautiful. Perfect for daily use and professional settings. The compartments are well-organized and exactly as shown in pictures. Highly recommend Rumiistore!",
      date: "December 15, 2024",
      productName: "Classic Leather Handbag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Black",
      helpfulVotes: 12,
      totalVotes: 14,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 2,
      customerName: "Ahmad H.",
      customerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Perfect work handbag for office!",
      review: "This luxury work handbag is absolutely outstanding! The leather quality is excellent and the laptop compartment is perfect. Great for office use and business meetings. The design stays professional all day and the material is very durable. Excellent value for money!",
      date: "December 14, 2024",
      productName: "Luxury Work Handbag",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Black",
      helpfulVotes: 18,
      totalVotes: 20,
      images: []
    },
    {
      id: 3,
      customerName: "Ayesha M.",
      customerImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Beautiful shoulder bag design!",
      review: "This elegant ladies shoulder bag is exactly what I was looking for. The design quality is incredible and the colors are so vibrant as promised. Perfect for casual outings and shopping. The material is soft and durable. Fast delivery too!",
      date: "December 12, 2024",
      productName: "Elegant Ladies Shoulder Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Red",
      helpfulVotes: 15,
      totalVotes: 16,
      images: [
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 4,
      customerName: "Maria K.",
      customerImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Excellent crossbody bag!",
      review: "This stylish crossbody bag is perfect for travel and daily use. Keeps my essentials secure and looks stylish at the same time. The material is high quality and the stitching is excellent. Great for both casual and semi-formal occasions. Excellent quality from Rumiistore.",
      date: "December 10, 2024",
      productName: "Stylish Crossbody Bag",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Black",
      helpfulVotes: 22,
      totalVotes: 24,
      images: []
    },
    {
      id: 5,
      customerName: "Zara L.",
      customerImage: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Elegant clutch bag is excellent!",
      review: "This elegant clutch bag is so sophisticated yet practical! The material feels luxurious and the design is stunning. The size is perfect and not too bulky. Great for special occasions and evening functions. Will definitely order more from Rumiistore.",
      date: "December 8, 2024",
      productName: "Elegant Clutch Bag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Black",
      helpfulVotes: 19,
      totalVotes: 21,
      images: []
    },
    {
      id: 6,
      customerName: "Hina R.",
      customerImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 4,
      title: "Good quality tote bag, fast delivery",
      review: "The large tote bag quality is very good for the price. Delivery was faster than expected and the packaging was excellent. The material is comfortable and perfect for daily use. The colors are nice and vibrant. Satisfied with my purchase.",
      date: "December 6, 2024",
      productName: "Large Tote Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Red",
      helpfulVotes: 14,
      totalVotes: 16,
      images: []
    },
    {
      id: 7,
      customerName: "Sadia S.",
      customerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Beautiful embroidered clutch collection!",
      review: "This embroidered ethnic clutch collection is absolutely stunning! The embroidery work and material quality are remarkable. Perfect for all types of cultural events. The design is elegant and carries perfectly while maintaining traditional appeal. Highly recommend for festive occasions!",
      date: "December 4, 2024",
      productName: "Embroidered Ethnic Clutch",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Red",
      helpfulVotes: 25,
      totalVotes: 27,
      images: [
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1566479179817-40660b69aa45?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 8,
      customerName: "Rabia K.",
      customerImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Exceeded expectations!",
      review: "This designer ladies handbag is even better than I expected. The material feels soft and luxurious all day. Perfect for both casual and formal occasions. The size is excellent and the design is very elegant. Great customer service from Rumiistore too!",
      date: "December 2, 2024",
      productName: "Designer Ladies Handbag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Red",
      helpfulVotes: 16,
      totalVotes: 18,
      images: []
    },
    {
      id: 9,
      customerName: "Amina T.",
      customerImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Premium quality mini crossbody",
      review: "The trendy mini crossbody quality is outstanding! This compact bag is perfect for carrying essentials. The material is gentle and durable, keeping my items secure all day. Received many compliments on how stylish the design looks.",
      date: "November 30, 2024",
      productName: "Trendy Mini Crossbody",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Small",
      color: "Pink",
      helpfulVotes: 21,
      totalVotes: 23,
      images: []
    },
    {
      id: 10,
      customerName: "Khadija M.",
      customerImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 4,
      title: "Good quality and stylish",
      review: "This vintage style satchel works perfectly for casual wear and is very comfortable. The material quality is good and the design is excellent. Only minor issue is that it needs careful handling to maintain the pristine look, but overall very effective for daily use.",
      date: "November 28, 2024",
      productName: "Vintage Style Satchel",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Brown",
      helpfulVotes: 11,
      totalVotes: 13,
      images: []
    },
    {
      id: 11,
      customerName: "Saira A.",
      customerImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Excellent evening party clutch",
      review: "This Evening Party Clutch is so beautiful and glamorous. Perfect for both parties and formal events. Adds elegance to any outfit effortlessly and the beaded quality is amazing. Great value for money!",
      date: "November 26, 2024",
      productName: "Evening Party Clutch",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Gold",
      helpfulVotes: 17,
      totalVotes: 19,
      images: []
    },
    {
      id: 12,
      customerName: "Farah B.",
      customerImage: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Professional quality at great price",
      review: "This quilted chain shoulder bag is absolutely fantastic! The leather quality is professional-grade and works for multiple occasions. Perfect for office and formal use. The packaging was also very secure and elegant.",
      date: "November 24, 2024",
      productName: "Quilted Chain Shoulder Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Black",
      helpfulVotes: 23,
      totalVotes: 25,
      images: [
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 13,
      customerName: "Uzma H.",
      customerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Modern and stylish handbag",
      review: "This minimalist leather handbag is perfect for modern fashion. The comfort and style are amazing and the quality lasts for years. Great for daily wear and special occasions. Highly satisfied with Rumiistore quality!",
      date: "November 22, 2024",
      productName: "Minimalist Leather Handbag",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Black",
      helpfulVotes: 13,
      totalVotes: 15,
      images: []
    },
    {
      id: 14,
      customerName: "Mehreen K.",
      customerImage: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Complete structured handbag perfection",
      review: "This structured top handle bag is absolutely perfect! The design and quality are amazing for complete professional styling. Perfect for business occasions and formal meetings. Worth every penny!",
      date: "November 20, 2024",
      productName: "Structured Top Handle Bag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Navy",
      helpfulVotes: 28,
      totalVotes: 30,
      images: []
    },
    {
      id: 15,
      customerName: "Rubina S.",
      customerImage: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 4,
      title: "Effective and convenient",
      review: "This sport crossbody bag is perfect for regular activities and exercise routines. Works effectively for different outdoor activities and occasions. The packaging is good and easy to use. Good quality for the price.",
      date: "November 18, 2024",
      productName: "Sport Crossbody Bag",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Black",
      helpfulVotes: 9,
      totalVotes: 11,
      images: []
    },
    {
      id: 16,
      customerName: "Shazia R.",
      customerImage: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Excellent luxury handbag quality",
      review: "This luxury designer handbag is perfect for elegant and sophisticated lifestyle. The premium materials work like magic for formal events and special occasions. Great for everyday luxury. Fast delivery from Rumiistore too!",
      date: "November 16, 2024",
      productName: "Luxury Designer Handbag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Black",
      helpfulVotes: 12,
      totalVotes: 14,
      images: []
    },
    {
      id: 17,
      customerName: "Tahira M.",
      customerImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Perfect for formal occasions!",
      review: "This eco-friendly tote bag is absolutely outstanding! Perfect for shopping and environmental consciousness. Works excellently for daily use and grocery shopping. Received excellent compliments every time!",
      date: "November 14, 2024",
      productName: "Eco-Friendly Tote Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Natural",
      helpfulVotes: 20,
      totalVotes: 22,
      images: [
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 18,
      customerName: "Yasmin A.",
      customerImage: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Ultra stylish canvas tote",
      review: "This casual canvas tote is incredibly effective and long-lasting! Perfect for shopping and maintaining eco-friendly lifestyle all day. The material is pleasant and not heavy. Great for daily wear and special events.",
      date: "November 12, 2024",
      productName: "Casual Canvas Tote",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Natural",
      helpfulVotes: 8,
      totalVotes: 10,
      images: []
    },
    {
      id: 19,
      customerName: "Samina K.",
      customerImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 4,
      title: "Good for daily wear",
      review: "This premium leather clutch is suitable for daily styling and formal events. The material is effective and the price is reasonable. The versatile design is good for regular accessory collection.",
      date: "November 10, 2024",
      productName: "Premium Leather Clutch",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Black",
      helpfulVotes: 7,
      totalVotes: 9,
      images: []
    },
    {
      id: 20,
      customerName: "Naila H.",
      customerImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Boho shoulder bag is excellent",
      review: "This boho style shoulder bag is absolutely reliable! The bohemian style is unique and the quality is outstanding. Great authentic fashion and fast shipping from Rumiistore. Love it!",
      date: "November 8, 2024",
      productName: "Boho Style Shoulder Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Brown",
      helpfulVotes: 15,
      totalVotes: 17,
      images: []
    },
    {
      id: 21,
      customerName: "Bushra S.",
      customerImage: "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Simple and elegant",
      review: "This classic leather handbag is perfect for those who love gentle yet elegant accessories. The design is clean and efficient. Great quality materials and comfortable to carry. Exactly what I was looking for!",
      date: "November 6, 2024",
      productName: "Classic Leather Handbag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "Brown",
      helpfulVotes: 10,
      totalVotes: 12,
      images: []
    },
    {
      id: 22,
      customerName: "Fouzia R.",
      customerImage: "https://images.unsplash.com/photo-1465485512101-4c502f3b9e67?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Premium handbag collection stunning!",
      review: "This elegant ladies shoulder bag collection is absolutely exquisite! The variety of designs and perfect craftsmanship are amazing for comprehensive accessory collection and professional use. The quality is outstanding. Worth the investment!",
      date: "November 4, 2024",
      productName: "Elegant Ladies Shoulder Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Small",
      color: "White",
      helpfulVotes: 32,
      totalVotes: 34,
      images: [
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1566479179817-40660b69aa45?w=400&h=400&fit=crop&crop=center"
      ]
    },
    {
      id: 23,
      customerName: "Riffat M.",
      customerImage: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Perfect for office wear",
      review: "This luxury work handbag is efficient yet stylish, perfect for workplace fashion and professional look. The design is practical and the style is excellent. Great for corporate environments. Highly recommend Rumiistore!",
      date: "November 2, 2024",
      productName: "Luxury Work Handbag",
      productImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Navy",
      helpfulVotes: 14,
      totalVotes: 16,
      images: []
    },
    {
      id: 24,
      customerName: "Shaista K.",
      customerImage: "https://images.unsplash.com/photo-1484588168347-9d835bb09939?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Traditional and elegant",
      review: "This embroidered ethnic clutch with authentic designs is beautiful and timeless. The quality is excellent and the craftsmanship is outstanding. Perfect for maintaining traditional style and cultural heritage.",
      date: "October 31, 2024",
      productName: "Embroidered Ethnic Clutch",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "One Size",
      color: "Green",
      helpfulVotes: 18,
      totalVotes: 20,
      images: []
    },
    {
      id: 25,
      customerName: "Nayab A.",
      customerImage: "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Commercial business bag perfect",
      review: "This structured top handle bag is perfect for corporate facilities and professional settings. The design is professional and the quality is high. Great functionality and excellent customer service from Rumiistore. Very satisfied!",
      date: "October 29, 2024",
      productName: "Structured Top Handle Bag",
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Black",
      helpfulVotes: 16,
      totalVotes: 18,
      images: []
    },
    {
      id: 26,
      customerName: "Ghazala S.",
      customerImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 4,
      title: "Good quality, minor color preference",
      review: "The quality is good and the style is effective. However, the color was slightly different than my preference. Overall satisfied with the purchase. The design results are perfect and the size is good.",
      date: "October 27, 2024",
      productName: "Designer Ladies Handbag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Medium",
      color: "White",
      helpfulVotes: 6,
      totalVotes: 8,
      images: []
    },
    {
      id: 27,
      customerName: "Lubna R.",
      customerImage: "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&h=150&fit=crop&crop=face",
      isVerifiedPurchase: true,
      rating: 5,
      title: "Amazing quality and style",
      review: "The quality of this eco-friendly tote bag is absolutely amazing! The attention to sustainable materials is incredible. Perfect for conscious shoppers and daily use. The style effectiveness is exceptional. Highly recommend Rumiistore!",
      date: "October 25, 2024",
      productName: "Eco-Friendly Tote Bag",
      productImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=150&h=150&fit=crop&crop=center",
      size: "Large",
      color: "Green",
      helpfulVotes: 24,
      totalVotes: 26,
      images: []
    }
  ];

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

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
                        {Math.round((ratingBreakdown[star] / totalReviews) * 100)}%
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
                {Math.round((ratingBreakdown[5] / totalReviews) * 100)}%
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