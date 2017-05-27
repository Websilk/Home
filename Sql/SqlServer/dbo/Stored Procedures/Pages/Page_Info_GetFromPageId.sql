

-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/22/2012 11:11 AM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Page_Info_GetFromPageId] 
	@pageId int = 0
AS
BEGIN
	SET NOCOUNT ON;

    SELECT p.websiteid, p.pageid, p.parentid, p.ownerId, w.title AS websitetitle, p.title, p.title_head, p.pagetype, 
	p.shadowId, p.shadowChildId, p.layout, p.[service], p.[path], p.pathIds,
	(CASE WHEN p.parentid IS NOT NULL THEN (SELECT title FROM pages WHERE pageid=p.parentid) ELSE NULL END) AS parenttitle, 
	(SELECT COUNT(*) FROM pages WHERE pathIds LIKE p.pathIds + '/%' AND pathlvl = p.pathlvl + 1) AS subpages,
	w.theme, w.colors, w.colorsEditor, w.colorsDash, p.[description], w.pagedenied, w.page404, w.[status], w.icon, p.[security], p.datecreated, p.[enabled], p.deleted,
    (SELECT TOP 1 d.googlewebpropertyid FROM websitedomains d WHERE d.websiteid=p.websiteId AND d.googlewebpropertyId IS NOT NULL ORDER BY d.datecreated ASC) AS googlewebpropertyid
    FROM pages p 
	LEFT JOIN websites w ON w.websiteid=p.websiteId
	WHERE p.pageid=@pageId
END
