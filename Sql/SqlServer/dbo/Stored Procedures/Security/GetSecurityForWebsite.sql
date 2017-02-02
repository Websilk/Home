-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/?/2013
-- Description:	
-- =============================================
CREATE PROCEDURE GetSecurityForWebsite 
	@websiteid int = 0, 
	@userid int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT pageid, feature, [security] FROM WebsiteSecurity 
	WHERE websiteid=@websiteid AND userid=@userid
END
