import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'uploaded':
        return {
          className: 'status-badge status-uploaded',
          text: 'Uploaded'
        };
      case 'annotated':
        return {
          className: 'status-badge status-annotated',
          text: 'Reviewed'
        };
      case 'reported':
        return {
          className: 'status-badge status-reported',
          text: 'Complete'
        };
      default:
        return {
          className: 'status-badge bg-gray-100 text-gray-800',
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={config.className}>
      {config.text}
    </span>
  );
};

export default StatusBadge;