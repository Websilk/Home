

-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/31/2012 8:37 PM
-- Description:	disables a user's account, 
-- including all Websites owned by the user
-- =============================================
CREATE PROCEDURE [dbo].[User_Disable] 
	@userId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE Users SET deleted=1, status=0 WHERE userId=@userId
	UPDATE Websites SET deleted=1 WHERE ownerId=@userId
	
	UPDATE Pages SET deleted=1 WHERE websiteId IN 
		(SELECT websiteId FROM Websites WHERE ownerId=@userId)
	
END
