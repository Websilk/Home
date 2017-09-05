CREATE VIEW [dbo].[View_PageInfo]
AS
	SELECT p.websiteid, p.pageid, p.parentid, p.ownerId, w.title AS websitetitle, p.title, p.[path], p.pathIds,
	(CASE WHEN p.parentid IS NOT NULL THEN (SELECT title FROM pages WHERE pageid=p.parentid) ELSE NULL END) AS parenttitle, 
	(SELECT COUNT(*) FROM pages WHERE pathIds LIKE p.pathIds + '/%' AND pathlvl = p.pathlvl + 1) AS subpages,
	p.[description], w.[status], p.[security], p.datecreated, p.[enabled], p.deleted
    FROM pages p 
	LEFT JOIN websites w ON w.websiteid=p.websiteId
