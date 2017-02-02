-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/27/2012
-- Description:	
-- =============================================
CREATE PROCEDURE UpdateThemeForWebSite 
	@websiteId int = 0, 
	@theme nvarchar(25) = ''
AS
BEGIN
	UPDATE WebSites SET theme=@theme WHERE websiteId=@websiteId
END
