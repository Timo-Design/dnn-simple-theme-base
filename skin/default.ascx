<%@ Control Language="vb" CodeBehind="~/admin/Skins/skin.vb" AutoEventWireup="false"
    Explicit="True" Inherits="DotNetNuke.UI.Skins.Skin" %>

<%@ Register TagPrefix="dnn" TagName="LOGIN" Src="~/Admin/Skins/Login.ascx" %>
<%@ Register TagPrefix="dnn" TagName="MENU" src="~/DesktopModules/DDRMenu/Menu.ascx" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.Client.ClientResourceManagement" Assembly="DotNetNuke.Web.Client" %>

<main class="theme-wrap">
<header class="theme-header">
<dnn:MENU MenuStyle="menu\razor-ul" runat="server" ExcludeNodes="Admin,Host"></dnn:MENU>
</header>
<section class="theme-content">
<div class="ContentPane Pane" id="ContentPane" runat="server"></div>
</section>
</main>

<!-- Load Theme js -->
<dnn:DnnJsInclude runat="server" ForceProvider="DnnFormBottomProvider" FilePath="skin.js" PathNameAlias="SkinPath" />
