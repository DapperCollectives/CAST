import { useMediaQuery } from "hooks";
import { mediaMatchers } from "hooks/useMediaQuery";
import { DesktopCard } from "./DesktopCard";
import { MobileTabletCard } from "./MobileTabletCard";

const ProposalCard = ({ pr, style = {} }) => {
  const isNotMobile = useMediaQuery();
  const isTabletOnly = useMediaQuery(mediaMatchers.tabletOnly);
  const isDesktopOnly = isNotMobile && !isTabletOnly;

  return isDesktopOnly
    ? <DesktopCard pr={pr} style={style} isDesktopOnly={isDesktopOnly} />
    : <MobileTabletCard pr={pr} style={style} isDesktopOnly={isDesktopOnly} />;
};

export default ProposalCard;
