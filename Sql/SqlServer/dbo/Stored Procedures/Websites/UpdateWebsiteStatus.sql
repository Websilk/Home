-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/11/2014 6:30 pm
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[UpdateWebsiteStatus] 
	@websiteId int = 0, 
	@ownerId int = 0,
	@status int = 0
AS
BEGIN
	UPDATE websites SET status = @status
	WHERE websiteid=@websiteId AND ownerid=@ownerId
END
