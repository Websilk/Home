-- =============================================
-- Author:		Mark Entingh
-- Create date: 12/17/2011 4:11 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetPageInfoFromSubDomainAndTitle] 
	@domain nvarchar(50) = '', 
	@subdomain nvarchar(50) = '', 
	@title nvarchar(100) = ''
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pId int
   SELECT @pId = p.pageid FROM pages p
	WHERE p.websiteid=(
		SELECT w.websiteid FROM websitesubdomains w WHERE w.domain = @domain AND w.subdomain=@subdomain
	) 
	AND p.[path]=@title AND p.deleted =0

	EXEC GetPageInfoFromPageId @pageId=@pId
END
