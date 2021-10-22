import React, { useState, createElement, useEffect, useCallback } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useSelector } from "react-redux";
import SettingsIcon from "@material-ui/icons/Settings";
import { useMediaQuery, Box, Typography, Avatar } from "@material-ui/core";
import { DashboardMenuItem, MenuItemLink, getResources, usePermissions } from "react-admin";
import { getLicenseList } from "services/setting";
import SubMenu from "./SubMenu";

import Skeleton from "@material-ui/lab/Skeleton";

const Menu = ({ onMenuClick, dense, logout }) => {
  const [state, setState] = useState({
    menuGl: false,
    menuAp: false,
    menuAr: false,
    menuAsset: false,
  });
  const [licenseList, setLicenseList] = useStateWithCallbackLazy([]);
  const [complete, setComplete] = useState(false);
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const open = useSelector((state) => state.admin.ui.sidebarOpen);
  useSelector((state) => state.theme); // force rerender on theme change
  const { loaded, permissions } = usePermissions();
  const resources = useSelector(getResources);
  const resourcesSubmenu = resources.filter((i) => i.options.IsSubmenu);
  //const translate = useTranslate();

  const handleToggle = (menu) => {
    const newState = {};
    Object.keys(state).forEach((item) => {
      if (menu === item) {
        newState[item] = !state[item];
      } else {
        newState[item] = false;
      }
    });
    setState(newState);
  };

  const CheckProductLicense = useCallback(async () => {
    const response = await getLicenseList();
    const list = response?.InterfacePermissionItems;
    setLicenseList(list, async (nextState) => await SetLicenstInMenu(nextState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SetLicenstInMenu = async (list) => {
    resourcesSubmenu.forEach((element) => {
      element.show = list.find((i) => i.UniqueId.Id === element.options.id).CanUse;
    });
    setComplete(true);
  };

  useEffect(() => {
    if (!complete) {
      CheckProductLicense();
    }
  }, [CheckProductLicense, complete]);

  useEffect(() => {
    if (licenseList && licenseList.length > 0) {
      resourcesSubmenu.forEach((element) => {
        element.show = licenseList.find((i) => i.UniqueId.Id === element.options.id).CanUse;
      });
    }
  }, [resources, resourcesSubmenu, licenseList]);

  const MenuWithPermission = ({ resource }) => {
    var disabled = false;
    if (permissions) {
      let foundItem = permissions.find((i) => i.Name === resource.options?.permitName);
      if (foundItem) {
        disabled = !foundItem.View;
      }
    }

    return loaded ? (
      <MenuItemLink
        key={resource.name}
        to={`/${resource.name}`}
        //primaryText={translate(`ra.module.${resource.options.label}`) || resource.name}
        primaryText={resource.options.label || resource.name}
        leftIcon={resource.icon ? createElement(resource.icon) : null}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        disabled={disabled}
      />
    ) : null;
  };

  return (
    <div>
      <DashboardMenuItem onClick={onMenuClick} sidebarIsOpen={open} />
      {resourcesSubmenu.map((subResource) =>
        subResource.show ? (
          <SubMenu
            key={subResource.name}
            handleToggle={() => handleToggle(subResource.name)}
            isOpen={state[subResource.name]}
            sidebarIsOpen={open}
            //name={translate(`ra.module.${subResource.options.label}`) || subResource.name}
            name={subResource.options.label || subResource.name}
            icon={subResource.icon}
            dense={dense}
          >
            {resources.map((resource) =>
              resource.options && subResource.name === resource.options.parentName ? (
                <MenuWithPermission key={resource.name} resource={resource} />
              ) : (
                ""
              )
            )}
          </SubMenu>
        ) : (
          <Box display="flex" alignItems="center" style={{ height: 48, padding: 4 }} key={subResource.name}>
            <Box margin={1}>
              <Skeleton variant="circle">
                <Avatar />
              </Skeleton>
            </Box>
            <Box width="70%">
              <Skeleton width="100%">
                <Typography>.</Typography>
              </Skeleton>
            </Box>
          </Box>
        )
      )}

      <MenuItemLink
        to={`/settings`}
        //primaryText={translate(`ra.module.Setting`)}
        primaryText={"Setting"}
        leftIcon={<SettingsIcon />}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />

      {/* Show config when mobile size */}

      <MenuItemLink
        to={`/configuration`}
        //primaryText={translate(`ra.module.Configuration`)}
        primaryText={"Configuration"}
        leftIcon={<SettingsIcon />}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />

      {isXSmall && logout}
    </div>
  );
};

export default Menu;
