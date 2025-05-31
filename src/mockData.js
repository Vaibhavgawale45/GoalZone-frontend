// client/src/mockData.js (Create this new file)

export const clubsData = [
  {
    id: '1',
    name: 'Eagles FC',
    location: 'North City',
    rating: 4.5,
    description: 'A premier club known for its strong youth development program and competitive senior teams focusing on skill and teamwork.',
    imageUrl: 'https://images.unsplash.com/photo-1551772330-995711710780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vdGJhbGwlMjBjbHVifGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    logoUrl: 'https://via.placeholder.com/100/FFFFFF/000000?Text=EaglesFC', // Placeholder logo
    carouselImages: [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vdGJhbGx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552667466-07770ae997a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZvb3RiYWxsJTIwYWN0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517045079034-79971699599c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZvb3RiYWxsJTIwdGVhbXxlbnwwfHx8fHx8MA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ],
    coach: {
      name: 'Coach Alex Morgan',
      // Add more coach details if needed
    },
    totalPlayers: 5, // Calculated or fetched
    players: [
      { id: 'p1', name: 'Samantha Miller', email: 's.miller@example.com', phone: '555-0101', imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg', rating: 4.8, skill: 'Forward Striker' },
      { id: 'p2', name: 'David Rodriguez', email: 'd.rod@example.com', phone: '555-0102', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg', rating: 4.5, skill: 'Midfield Maestro' },
      { id: 'p3', name: 'Aisha Khan', email: 'a.khan@example.com', phone: '555-0103', imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg', rating: 4.6, skill: 'Solid Defender' },
      { id: 'p4', name: 'Samantha Miller', email: 's.miller@example.com', phone: '555-0101', imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg', rating: 4.8, skill: 'Forward Striker' },
      { id: 'p5', name: 'David Rodriguez', email: 'd.rod@example.com', phone: '555-0102', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg', rating: 4.5, skill: 'Midfield Maestro' },
    ]
  },
  // Add other clubs from your HomePage mockClubs here if you want them to resolve
  { id: '2', name: 'Lions United', location: 'South Park', rating: 4.2, description: 'Community focused club offering programs for all ages and skill levels.', imageUrl: 'https://images.unsplash.com/photo-1581584849655-5de38f130012?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vdGJhbGwlMjBjbHVifGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60', logoUrl: 'https://via.placeholder.com/100/FFFFFF/000000?Text=LionsU', coach: { name: 'Coach Ben Carter' }, totalPlayers: 0, players: [], carouselImages: ['https://images.unsplash.com/photo-1581584849655-5de38f130012?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vdGJhbGwlMjBjbHVifGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60']},
  // ... other clubs from your HomePage mock
];

export const getClubById = (id) => {
  return clubsData.find(club => club.id === id);
};

// Update HomePage.js to use this mock data source too for consistency
export const getAllClubs = () => {
    return clubsData;
}