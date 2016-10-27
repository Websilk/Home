-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/2/2008
-- Description:	get website information
-- =============================================
CREATE PROCEDURE [dbo].[GetWebsite] 
	@websiteId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT w.websiteId, w.title, p.pageid, p.datecreated,
	(SELECT COUNT(*) FROM pages WHERE websiteid=@websiteId) AS totalPages
	FROM websites w 
	LEFT JOIN pages p ON p.pageid=w.pagehome 
	WHERE w.websiteId=@websiteId
	AND w.deleted=0
	AND w.enabled=1
END
