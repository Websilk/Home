-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/16/2015 3:06 AM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Page_Info_GetFromDomainAndTitle]
	@domain nvarchar(200),
	@title nvarchar(200)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pId int
	SELECT @pId = p.pageid FROM pages p
	WHERE p.websiteid=(
		SELECT w.websiteid FROM websitedomains w WHERE w.domain = @domain
	) 
	AND p.[path]=@title AND p.deleted =0

    EXEC GetPageInfoFromPageId @pageId=@pId

END