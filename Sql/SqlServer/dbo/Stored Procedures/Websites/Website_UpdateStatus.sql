-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/11/2014 6:30 pm
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Website_UpdateStatus] 
	@websiteId int = 0, 
	@ownerId int = 0,
	@status int = 0
AS
BEGIN
	UPDATE Websites SET status = @status
	WHERE websiteId=@websiteId AND ownerId=@ownerId
END
