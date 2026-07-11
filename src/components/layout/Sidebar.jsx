// Sidebar renders the persistent left navigation icons for each main tab.
import IconButton from "../cards/IconButton";

const tabs = [
  { id: "chats", label: "Chats", iconUrl: "/icons/icon_chat.svg" },
  { id: "characters", label: "Characters", iconUrl: "/icons/icon_masks.svg" },
  { id: "user", label: "User", iconUrl: "/icons/icon_fingerprint.svg" },
  { id: "images", label: "Images", iconUrl: "/icons/icon_image.svg" },
  { id: "settings", label: "Settings", iconUrl: "/icons/icon_gear.svg" },
];

export default function Sidebar({ activePage, onChangePage }) {
  return (
    <aside className="sidebar">
      {tabs.map((tab) => (
        <IconButton
          key={tab.id}
          label={tab.label}
          iconUrl={tab.iconUrl}
          active={activePage === tab.id}
          onClick={() => onChangePage(tab.id)}
        />
      ))}
    </aside>
  );
}
