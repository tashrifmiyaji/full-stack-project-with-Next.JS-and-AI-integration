import * as React from 'react';

interface verificationEmailProps {
  username: string;
  otp: string;
}

export default function verificationEmailTemplate({ username, otp }: verificationEmailProps) {
  return (
    <div>
      <h1>Welcome, {username}!</h1>
    </div>
  );
}

