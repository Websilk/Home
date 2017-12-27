CREATE VIEW [dbo].[View_PageInfo]
AS
	SELECT p.websiteId, p.pageId, p.parentId, p.ownerId, w.title AS websitetitle, p.title, p.[path], p.pathIds,
	(CASE WHEN p.parentId IS NOT NULL THEN (SELECT title FROM Pages WHERE pageId=p.parentId) ELSE NULL END) AS parenttitle, 
	(SELECT COUNT(*) FROM Pages WHERE pathIds LIKE p.pathIds + '/%' AND pathlvl = p.pathlvl + 1) AS subpages,
	p.[description], w.[status], p.[security], p.dateCreated, p.[enabled], p.deleted
    FROM Pages p 
	LEFT JOIN Websites w ON w.websiteId=p.websiteId
