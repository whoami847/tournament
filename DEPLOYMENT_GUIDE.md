# Vercel Deployment Guide

এই গাইডটি আপনাকে ধাপে ধাপে দেখাবে কীভাবে আপনার Next.js অ্যাপ্লিকেশনটি Vercel-এ সফলভাবে ডেপ্লয় করবেন।

---

## ধাপ ১: আপনার কোড GitHub-এ আপলোড করুন

যদি আপনার কোড ইতিমধ্যে GitHub, GitLab, বা Bitbucket-এ আপলোড করা না থাকে, তবে প্রথমে একটি নতুন রিপোজিটরি তৈরি করে আপনার কোড সেখানে পুশ করুন। Vercel এই প্ল্যাটফর্মগুলো থেকে সরাসরি আপনার কোড ইম্পোর্ট করতে পারে।

---

## ধাপ ২: Vercel-এ নতুন প্রজেক্ট তৈরি করুন

1.  আপনার Vercel অ্যাকাউন্টে লগইন করুন।
2.  "Add New..." বাটনে ক্লিক করে "Project" নির্বাচন করুন।
3.  "Import Git Repository" সেকশন থেকে আপনার গিট রিপোজিটরিটি ইম্পোর্ট করুন। Vercel স্বয়ংক্রিয়ভাবে এটিকে একটি Next.js প্রজেক্ট হিসেবে শনাক্ত করবে।

---

## ধাপ ৩: এনভায়রনমেন্ট ভেরিয়েবল যোগ করুন (সবচেয়ে গুরুত্বপূর্ণ ধাপ)

আপনার অ্যাপটি Firebase-এর সাথে সংযুক্ত, তাই Vercel-কে আপনার Firebase প্রজেক্টের তথ্যগুলো জানাতে হবে। এই তথ্যগুলো এনভায়রনমেন্ট ভেরিয়েবল হিসেবে যোগ করতে হয়।

1.  প্রজেক্ট ইম্পোর্ট করার পর, "Configure Project" পৃষ্ঠায় "Environment Variables" সেকশনটি খুলুন।
2.  নিচের **প্রতিটি** ভেরিয়েবল একে একে যোগ করুন।

| Name                                      | Value                                               |
| ----------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`            | `আপনার Firebase প্রজেক্টের API Key`                |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`        | `আপনার Firebase প্রজেক্টের Auth Domain`             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`         | `আপনার Firebase প্রজেক্টের Project ID`              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`     | `আপনার Firebase প্রজেক্টের Storage Bucket`          |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| `আপনার Firebase প্রজেক্টের Messaging Sender ID`    |
| `NEXT_PUBLIC_FIREBASE_APP_ID`             | `আপনার Firebase প্রজেক্টের App ID`                  |

### এই ভেরিয়েবলের মানগুলো কোথায় পাবেন?

*   আপনার [Firebase Console](https://console.firebase.google.com/)-এ যান।
*   আপনার প্রজেক্টটি সিলেক্ট করুন।
*   বাম পাশের মেনু থেকে **Project Settings** (⚙️ আইকনে ক্লিক করে) এ যান।
*   "General" ট্যাবের নিচে, "Your apps" সেকশনে আপনার ওয়েব অ্যাপটি সিলেক্ট করুন।
*   "SDK setup and configuration" সেকশনে `firebaseConfig` অবজেক্টের মধ্যে উপরের সব মান পেয়ে যাবেন।

![Firebase Config Location](https://i.ibb.co/VvW012s/firebase-config.png)

---

## ধাপ ৪: ডেপ্লয় করুন

সবগুলো এনভায়রনমেন্ট ভেরিয়েবল সঠিকভাবে যোগ করার পর, "Deploy" বাটনে ক্লিক করুন। Vercel স্বয়ংক্রিয়ভাবে আপনার অ্যাপটি বিল্ড এবং ডেপ্লয় করা শুরু করবে।

## অভিনন্দন!

কিছুক্ষণের মধ্যেই আপনার অ্যাপটি সফলভাবে ডেপ্লয় হয়ে যাবে এবং আপনি একটি লাইভ URL পেয়ে যাবেন। এখন থেকে, আপনার গিট রিপোজিটরির `master` বা `main` ব্রাঞ্চে করা যেকোনো পরিবর্তন স্বয়ংক্রিয়ভাবে Vercel-এ ডেপ্লয় হয়ে যাবে।
