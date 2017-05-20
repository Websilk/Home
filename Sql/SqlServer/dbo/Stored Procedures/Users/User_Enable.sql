

-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/31/2012 8:37 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[User_Enable] 
	@userId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE Users SET deleted=0, status=1 WHERE userId=@userId
	UPDATE WebSites SET deleted=0 WHERE ownerId=@userId
	UPDATE Pages SET deleted=0 WHERE websiteId IN 
		(SELECT websiteid FROM WebSites WHERE ownerid=@userId)
	
END
