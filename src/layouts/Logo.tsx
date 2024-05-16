import { rect, weight } from '@/utils/logo';

const Logo = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <rect {...rect} x="0" y="0" width="512" height={weight} />
      <rect {...rect} x={512 - weight} y="0" width={weight} height="1024" />
      <rect {...rect} x="0" y={1024 - weight} width="512" height={weight} />
      <rect {...rect} x="0" y="512" width={weight} height="512" />
      <rect {...rect} x="0" y="512" width="512" height={weight} />
      <rect {...rect} x="512" y={512 - weight} width="512" height={weight} />
      <rect {...rect} x={1024 - weight} y="0" width={weight} height="512" />
      <rect {...rect} x="512" y="0" width="512" height={weight} />
      <rect {...rect} x="512" y="0" width={weight} height="768" />
      <rect {...rect} x="512" y={768 - weight} width="512" height={weight} />
      <rect {...rect} x={1024 - weight} y="512" width={weight} height="246" />
      <rect {...rect} x="768" y="512" width="256" height={weight} />
      <rect {...rect} x="768" y="512" width={weight} height="512" />
      <rect {...rect} x="512" y={1024 - weight} width="256" height={weight} />
      <rect {...rect} x="512" y="768" width={weight} height="256" />
      <rect {...rect} x="512" y="768" width="512" height={weight} />
      <rect {...rect} x={1024 - weight} y="768" width={weight} height="256" />
    </svg>
  );
};

export default Logo;
