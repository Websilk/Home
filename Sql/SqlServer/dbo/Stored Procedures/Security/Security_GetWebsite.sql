-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/?/2013
-- Description:	
-- =============================================
CREATE PROCEDURE Security_GetWebsite
	@websiteId int = 0, 
	@userId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * FROM [Security] 
	WHERE websiteId=@websiteId AND userId=@userId
END
