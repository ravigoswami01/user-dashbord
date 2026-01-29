import { FC, useRef } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  bio?: string;
  joinedAt?: string;
  lastSeen?: string;
};

interface UserCardProps {
  user: User;
  onClick?: (userId: string, triggerRef: React.RefObject<HTMLElement>) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onClick }) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    onClick?.(user.id, cardRef as React.RefObject<HTMLElement>);
  };

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className="w-full bg-white shadow-md rounded-lg p-4 border hover:shadow-xl hover:border-blue-300 transition-all active:scale-98 cursor-pointer text-left flex gap-4 items-start"
      aria-label={`View details for ${user.name}`}
    >
      {user.avatar && (
        <img
          src={user.avatar}
          alt={`${user.name} avatar`}
          className="w-16 h-16 rounded-full object-cover"
        />
      )}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
         <div className="mt-3 flex items-center gap-3">
          <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
            {user.status}
          </span>
        </div>
      </div>
    </button>
  );
};

export default UserCard;
