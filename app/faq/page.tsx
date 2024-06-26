"use client";

import React, { useState } from 'react';
import './faq.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How many wives are you looking for?",
      answer: "1"
    },
    {
      question: "Do you have a green card?",
      answer: "No, but I used to"
    },
    {
      question: "What it was like to immigrate to the US amidst a global pandemic.",
      answer: "eatmypoo.com"
    },
    {
      question: "What is your return policy?",
      answer: "Our return policy is simple. If you are not satisfied with your purchase, you can return it within 30 days for a full refund."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we offer international shipping to most countries. Shipping rates and delivery times vary depending on the destination."
    },
    // Add more FAQs as needed
  ];

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <h2 onClick={() => toggleFAQ(index)}>{faq.question}</h2>
          <p style={{ display: openIndex === index ? 'block' : 'none' }}>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
