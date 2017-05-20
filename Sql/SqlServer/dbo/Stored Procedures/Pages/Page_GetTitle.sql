CREATE PROCEDURE [dbo].[Page_GetTitle]
	@pageId int = 0
AS
SELECT p.title, p.parentid, p.path, p.pathids, (SELECT title FROM pages WHERE pageid=p.parentId) AS parenttitle, p.security 
FROM pages p WHERE p.pageid=@pageId