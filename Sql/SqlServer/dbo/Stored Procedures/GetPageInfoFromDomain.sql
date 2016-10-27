-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/17/2015 3:06 AM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetPageInfoFromDomain]
	@domain nvarchar(200)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pId int
	SELECT @pId = p.pageid FROM websitedomains w LEFT JOIN pages p ON p.pageid=(SELECT w2.pagehome FROM websites w2 WHERE w2.websiteid=w.websiteid) WHERE w.domain = @domain AND p.deleted=0
    EXEC GetPageInfoFromPageId @pageId=@pId
END