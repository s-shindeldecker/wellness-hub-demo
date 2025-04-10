# Mock data for health and wellness providers, services, and classes

# Mock wellness providers
MOCK_PROVIDERS = [
    {
        "id": "wellness-center-1",
        "name": "Harmony Wellness Center",
        "address": "123 Serenity Lane, Los Angeles, CA 90001",
        "rating": 4.8,
        "specialties": ["Yoga", "Meditation", "Massage Therapy"],
        "image": "https://placehold.co/460x300/0080ff/ffffff?text=Harmony+Wellness+Center"
    },
    {
        "id": "fitness-studio-1",
        "name": "Elevate Fitness Studio",
        "address": "456 Energy Blvd, Los Angeles, CA 90002",
        "rating": 4.7,
        "specialties": ["Personal Training", "Group Fitness", "Nutrition Counseling"],
        "image": "https://placehold.co/460x300/00bf60/ffffff?text=Elevate+Fitness+Studio"
    },
    {
        "id": "spa-retreat-1",
        "name": "Tranquil Spa & Retreat",
        "address": "789 Relaxation Ave, Los Angeles, CA 90003",
        "rating": 4.9,
        "specialties": ["Massage", "Facials", "Aromatherapy"],
        "image": "https://placehold.co/460x300/9c27b0/ffffff?text=Tranquil+Spa+%26+Retreat"
    }
]

# Mock services offered by providers
MOCK_SERVICES = {
    "yoga": [
        {"name": "Vinyasa Flow", "duration": "60 min", "price": "$25"},
        {"name": "Hatha Yoga", "duration": "75 min", "price": "$30"},
        {"name": "Yin Yoga", "duration": "90 min", "price": "$35"},
        {"name": "Power Yoga", "duration": "60 min", "price": "$28"},
        {"name": "Restorative Yoga", "duration": "90 min", "price": "$35"}
    ],
    "fitness": [
        {"name": "Personal Training", "duration": "45 min", "price": "$65"},
        {"name": "Group HIIT", "duration": "45 min", "price": "$22"},
        {"name": "Strength Training", "duration": "60 min", "price": "$30"},
        {"name": "Cardio Kickboxing", "duration": "60 min", "price": "$25"},
        {"name": "Pilates Reformer", "duration": "50 min", "price": "$40"}
    ],
    "wellness": [
        {"name": "Deep Tissue Massage", "duration": "60 min", "price": "$85"},
        {"name": "Swedish Massage", "duration": "90 min", "price": "$110"},
        {"name": "Facial Treatment", "duration": "60 min", "price": "$95"},
        {"name": "Nutrition Consultation", "duration": "45 min", "price": "$75"},
        {"name": "Acupuncture", "duration": "60 min", "price": "$90"}
    ],
    "meditation": [
        {"name": "Guided Meditation", "duration": "45 min", "price": "$20"},
        {"name": "Mindfulness Practice", "duration": "60 min", "price": "$25"},
        {"name": "Sound Bath", "duration": "75 min", "price": "$35"},
        {"name": "Breathwork", "duration": "45 min", "price": "$30"},
        {"name": "Meditation for Beginners", "duration": "60 min", "price": "$22"}
    ]
}

# Mock class schedule with different times
MOCK_SCHEDULE = {
    "morning": [
        {"time": "6:00 AM", "class": "Power Yoga", "instructor": "Sarah J.", "spots": "8/12"},
        {"time": "7:15 AM", "class": "HIIT Training", "instructor": "Mike T.", "spots": "10/15"},
        {"time": "8:30 AM", "class": "Meditation", "instructor": "David L.", "spots": "5/10"},
        {"time": "9:45 AM", "class": "Pilates", "instructor": "Emma R.", "spots": "12/15"},
        {"time": "11:00 AM", "class": "Nutrition Workshop", "instructor": "Dr. Lisa M.", "spots": "6/8"}
    ],
    "afternoon": [
        {"time": "12:15 PM", "class": "Hatha Yoga", "instructor": "Michael B.", "spots": "7/15"},
        {"time": "1:30 PM", "class": "Strength Training", "instructor": "Jessica K.", "spots": "9/12"},
        {"time": "2:45 PM", "class": "Guided Meditation", "instructor": "David L.", "spots": "4/10"},
        {"time": "4:00 PM", "class": "Cardio Kickboxing", "instructor": "Tanya W.", "spots": "11/15"},
        {"time": "5:15 PM", "class": "Yin Yoga", "instructor": "Sarah J.", "spots": "8/12"}
    ],
    "evening": [
        {"time": "6:30 PM", "class": "Vinyasa Flow", "instructor": "Michael B.", "spots": "14/15"},
        {"time": "7:45 PM", "class": "Group HIIT", "instructor": "Mike T.", "spots": "8/12"},
        {"time": "8:00 PM", "class": "Sound Bath", "instructor": "Emma R.", "spots": "6/10"},
        {"time": "8:15 PM", "class": "Restorative Yoga", "instructor": "Sarah J.", "spots": "9/12"}
    ]
}

# Predefined sort variations for the experiment
SORT_VARIATIONS = {
    "variation_1": ["yoga", "fitness", "wellness", "meditation"],
    "variation_2": ["fitness", "yoga", "meditation", "wellness"],
    "variation_3": ["wellness", "meditation", "yoga", "fitness"],
    "variation_4": ["meditation", "wellness", "fitness", "yoga"]
}

# Mock user segments for personalization
MOCK_USER_SEGMENTS = {
    "fitness_enthusiast": {
        "interests": ["HIIT", "Strength Training", "Nutrition"],
        "recommended_services": ["Personal Training", "Group HIIT", "Nutrition Consultation"],
        "recommended_providers": ["Elevate Fitness Studio"]
    },
    "wellness_seeker": {
        "interests": ["Yoga", "Meditation", "Massage"],
        "recommended_services": ["Vinyasa Flow", "Guided Meditation", "Deep Tissue Massage"],
        "recommended_providers": ["Harmony Wellness Center", "Tranquil Spa & Retreat"]
    },
    "stress_relief": {
        "interests": ["Meditation", "Massage", "Aromatherapy"],
        "recommended_services": ["Sound Bath", "Swedish Massage", "Breathwork"],
        "recommended_providers": ["Tranquil Spa & Retreat", "Harmony Wellness Center"]
    },
    "new_to_wellness": {
        "interests": ["Beginner Classes", "Consultations"],
        "recommended_services": ["Meditation for Beginners", "Nutrition Consultation", "Hatha Yoga"],
        "recommended_providers": ["Harmony Wellness Center", "Elevate Fitness Studio"]
    }
}

# Mock user profiles (would normally be in a database)
MOCK_USERS = {
    "user1": {
        "id": "user1",
        "name": "Alex Johnson",
        "email": "alex@example.com",
        "segment": "fitness_enthusiast",
        "preferences": {
            "favorite_activities": ["HIIT", "Strength Training"],
            "preferred_times": ["morning", "evening"],
            "notifications": True
        }
    },
    "user2": {
        "id": "user2",
        "name": "Jamie Smith",
        "email": "jamie@example.com",
        "segment": "wellness_seeker",
        "preferences": {
            "favorite_activities": ["Yoga", "Meditation"],
            "preferred_times": ["afternoon"],
            "notifications": True
        }
    },
    "user3": {
        "id": "user3",
        "name": "Taylor Brown",
        "email": "taylor@example.com",
        "segment": "stress_relief",
        "preferences": {
            "favorite_activities": ["Massage", "Sound Bath"],
            "preferred_times": ["evening"],
            "notifications": False
        }
    },
    "user4": {
        "id": "user4",
        "name": "Jordan Lee",
        "email": "jordan@example.com",
        "segment": "new_to_wellness",
        "preferences": {
            "favorite_activities": ["Beginner Classes"],
            "preferred_times": ["afternoon", "evening"],
            "notifications": True
        }
    }
}
