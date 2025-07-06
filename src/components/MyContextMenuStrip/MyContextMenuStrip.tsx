import React, {
  cloneElement,
  ReactElement,
  MouseEvent,
  useState,
} from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MyContextMenuStripProps } from "../../util";


export default function MyContextMenuStrip({
  callbacks,
  target,
}: MyContextMenuStripProps) {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 4,
    });
  };
  const closeMenu = () => setContextMenu(null);

  // Клонируем переданный элемент, внедряя в него onContextMenu и стиль
  const wrappedTarget = cloneElement<React.HTMLAttributes<HTMLElement>>(
    target,
    {
      onContextMenu: openMenu,
      style: {
        // приводим к нужному типу, чтобы не было ошибок
        ...(target.props.style as React.CSSProperties),
        cursor: "context-menu",
      },
    }
  );

  return (
    <>
      {wrappedTarget}

      <Menu
        open={!!contextMenu} // первый ! приводит к boolean и навешивает отрицание, второй ! еще раз навешивает отрицание чтобы убрать предыдущее 
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {callbacks.map((cb, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              cb.callback();
              closeMenu();
            }}
          >
            {cb.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
