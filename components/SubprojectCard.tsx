'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface SubprojectCardProps {
  subproject: {
    id: string;
    name: string;
  };
  projectId: number;
  userRole: string;
  onUserClick?: (subprojectId: string) => void;
}

export default function SubprojectCard({
  subproject,
  projectId,
  userRole,
  onUserClick,
}: SubprojectCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (userRole.toUpperCase() === 'ADMIN') {
      router.push(`/costboard?projectId=${projectId}&subprojectId=${subproject.id}`);
    } else {
      onUserClick?.(subproject.id);
    }
  };


  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      className="bg-gray-50 p-4 rounded-md shadow cursor-pointer hover:shadow-lg transition"
    >
      <p className="font-medium text-gray-800">{subproject.name}</p>
    </motion.div>
  );
}
